#!/usr/bin/python2.7
import codecs
import logging
import os
import re
import sys
from django.core.management.base import BaseCommand
from django.db import transaction
from dragonnest.settings import BASE_DIR
sys.path.insert(0, os.path.join('..', 'assets', 'dnestpy'))
from dnt.dntfile import DNTFile
from skills.models import Job, Skill, SkillLevel
from skills.utils import hash_

log = logging.getLogger('command')
_dntlist = [
    'uistring.xml',
    'jobtable.dnt',
    'skilltable_character.dnt',
    'skilltreetable.dnt',
    'skillleveltable_characteracademic.dnt',
    'skillleveltable_characterarcher.dnt',
    'skillleveltable_charactercleric.dnt',
    'skillleveltable_characterkali.dnt',
    'skillleveltable_charactersoceress.dnt',
    'skillleveltable_characterwarrior.dnt',
]
_ultimates = [
    "Nature's Rage",
    "Falling Star",
    "Divine Hammer",
    "Heart of Glory",
    "Heavenly Judgement",
    "Grand Sigil",
    "Frolic",
    "Typhoon Ewiniar",
    "Phantom Avenger",
    "Dragon Bite",
    "Volcanic Vortex",
    "Frozen Fury",
    "Meteor Storm",
    "Beam Tempest",
    "Frost Fangs",
    "Toxic Surge",
    "Bullet Barrage",
    "The Quackums",
    "Cleaving Gale",
    "Calamity Crush",
    "Infinity Edge",
    "Blade Storm",
]


def readlines(f, bufsize):
    """Helper function to read a codecs file with linebreaks at only \\r\\n."""
    buf = u''
    data = True
    while data:
        data = f.read(bufsize)
        buf += data
        lines = buf.split('\r\n')
        buf = lines.pop()
        for line in lines:
            yield line
    yield buf


class Command(BaseCommand):
    """Admin command to import models from dragonnest DNT files."""
    args = '<dir>'
    help = 'Imports models from DragonNest DNT files from a given directory'

    _uistring = {}
    _jobmap = {}
    _skillmap = {}

    def handle(self, *args, **options):
        """Main import function."""
        log.info('skill.management.commands.import')
        filedir = args[0]
        assert os.path.isdir(filedir), 'Argument must be a directory path'
        filename = [os.path.join(filedir, x) for x in _dntlist]
        missing = [x for x in filename if not os.path.isfile(x)]
        assert len(missing) == 0, 'Files %s not found' % missing
        log.info('Resource checks passed.')

        log.info('Cleaning database')
        SkillLevel.objects.all().delete()
        Skill.objects.all().delete()
        Job.objects.all().delete()

        log.info('Beginning Import')
        self.import_uistring(filename[0])
        self.import_jobs(DNTFile(filename[1]))
        self.import_skills(DNTFile(filename[2]))
        self.import_slevels(filename[4:])
        self.import_skilltree(DNTFile(filename[3]))

        log.info('Cleaning Unnessecary Skills')
        Skill.objects.filter(tree_index=None).delete()

    def import_uistring(self, filename):
        """Parses DragonNest UIString.xml file into a python dict."""
        log.info('import_uistring\tfile\t%s' % filename)
        message_re = re.compile(
            r'<message mid="(\d+)"><!\[CDATA\[(.+)\]\]></message>',
            re.UNICODE | re.DOTALL)
        with codecs.open(filename, encoding='utf-8', mode='r') as f:
            for line in readlines(f, 524288):
                match = message_re.match(line)
                if match:
                    self._uistring[int(match.group(1))] = match.group(2)

    @transaction.commit_on_success
    def import_jobs(self, jobfile):
        """Import jobs from jobtable.dnt to django models."""
        log.info('import_jobs\tfile\t%s' % jobfile.filename)
        jobfile.read_all()
        log.info('import_jobs\tParsed DNT File')
        for row in jobfile.rows:
            try:
                name = self._uistring[row.JobName]
                number = row.JobNumber
                # Only works because the classes are stored in order.
                # Parent assignments should be done after all jobs imported
                parent_id = self._jobmap.get(row.ParentJob, None)
            except KeyError:
                continue
            job = Job(name=name, number=number, parent_id=parent_id)
            job.save()
            self._jobmap[row.id] = job.id
        log.info('Parsed %d Jobs' % Job.objects.all().count())

    @transaction.commit_on_success
    def import_skills(self, skillfile):
        """Import skills from skilltable_character.dnt to django models."""
        log.info('import_skills\tfile\t%s' % skillfile.filename)
        skillfile.read_all()
        log.info('import_skills\tParsed DNT File')
        for row in skillfile.rows:
            if row.id > 30000:
                # These are reserved and conflict with real skills
                break
            try:
                name = self._uistring[row.NameID]
                job_id = self._jobmap[row.NeedJob]
                icon = row.IconImageIndex
                ultimate = name in _ultimates
            except KeyError:
                continue
            skill = Skill(name=name, job_id=job_id, icon=icon, ultimate=ultimate)
            skill.save()
            self._skillmap[row.id] = skill.id
        log.info('Parsed %d Skills' % Skill.objects.all().count())

    @transaction.commit_on_success
    def import_skilltree(self, treefile):
        """Fix parent references, tree info, and sp costs on skills."""
        log.info('import_skilltree\tfile\t%s' % treefile.filename)
        treefile.read_all()
        log.info('import_skilltree\tParsed DNT File')
        for row in treefile.rows:
            if row.SkillTableID == 0:
                continue
            try:
                skill = Skill.objects.get(id=self._skillmap[row.SkillTableID])
            except KeyError:
                continue
            skill.tree_index = row.TreeSlotIndex
            if row.ParentSkillID1:
                skill.parent_1 = SkillLevel.objects.filter(
                    skill__id=self._skillmap[row.ParentSkillID1],
                    level=row.NeedParentSkillLevel1).get()
            if row.ParentSkillID2:
                skill.parent_2 = SkillLevel.objects.filter(
                    skill__id=self._skillmap[row.ParentSkillID2],
                    level=row.NeedParentSkillLevel2).get()
            if row.ParentSkillID3:
                skill.parent_3 = SkillLevel.objects.filter(
                    skill__id=self._skillmap[row.ParentSkillID3],
                    level=row.NeedParentSkillLevel3).get()
            skill.sp_required_0 = row.NeedBasicSP1
            skill.sp_required_1 = row.NeedFirstSP1
            skill.sp_required_2 = row.NeedSecondSP1
            skill.save()

    @transaction.commit_on_success
    def import_slevels(self, slevelfiles):
        """Import skilllevels from skillleveltable_characterx.dnt to django models."""
        # Ugly and inefficient
        # Should avoid loading all slevels into memory before parsing
        rows = []
        for f in slevelfiles:
            slevelfile = DNTFile(f)
            log.info('import_slevels\tfile\t%s' % slevelfile.filename)
            slevelfile.read_all()
            log.info('import_slevels\tParsed DNT File')
            rows.extend(slevelfile.rows)
        desc_re = re.compile(r'\{(\d+)\}')
        repl = lambda m: self._uistring[int(m.group(1))]
        # sort the rows so it goes 1-pve, 1-pvp, 2-pve, 2-pvp...
        rows.sort(key=lambda x: (x.SkillLevel, x.id))
        for oldid, newid in self._skillmap.iteritems():
            skill = Skill.objects.filter(id=newid).get()
            flt = lambda x: x.SkillIndex == oldid and x.SkillLevel <= 100
            slevels = filter(flt, rows)
            if len(slevels) < 2 or len(slevels) % 2 != 0:
                continue
            skill.description = self._uistring[slevels[0].SkillExplanationID]
            skill.save(update_fields=['description'])
            sp_cumulative = 0
            for pve, pvp in zip(slevels[::2], slevels[1::2]):
                pve_params = desc_re.sub(repl, pve.SkillExplanationIDParam)
                pvp_params = desc_re.sub(repl, pvp.SkillExplanationIDParam)
                sp_cumulative += pve.NeedSkillPoint
                assert pve.SkillLevel == pvp.SkillLevel, 'Slevel ordering error'
                slevel = SkillLevel(
                    level=pve.SkillLevel,
                    description_params_pve=pve_params,
                    description_params_pvp=pvp_params,
                    required_level=pve.LevelLimit,
                    skill=skill,
                    sp_cost=pve.NeedSkillPoint,
                    sp_cost_cumulative=sp_cumulative,
                    cooldown_pve=pve.DelayTime*0.001,
                    cooldown_pvp=pvp.DelayTime*0.001,
                    mp_cost_pve=pve.DecreaseSP*0.1,
                    mp_cost_pvp=pvp.DecreaseSP*0.1)
                slevel.save()
        log.info('Parsed %d SkillLevels' % SkillLevel.objects.all().count())
