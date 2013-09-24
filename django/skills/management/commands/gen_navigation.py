#!/usr/bin/python2.7
import logging
from django.core.management.base import BaseCommand
from skills.models import Job
from skills.utils import hash_

log = logging.getLogger('command')

_item = ['Archer', 'Cleric', 'Kali', 'Sorceress', 'Tinkerer', 'Warrior']
_subitem = [
    ('Acrobat', 'Tempest', 'Windwalker'),
    ('Sharpshooter', 'Sniper', 'Warden'),
    ('Paladin', 'Crusader', 'Guardian'),
    ('Priest', 'Inquisitor', 'Saint'),
    ('Dancer', 'Blade Dancer', 'Spirit Dancer'),
    ('Screamer', 'Dark Summoner', 'Soul Eater'),
    ('Elementalist', 'Ice Witch', 'Pyromancer'),
    ('Mystic', 'Chaos Mage', 'War Mage'),
    ('Alchemist', 'Adept', 'Physician'),
    ('Engineer', 'Gear Master', 'Shooting Star'),
    ('Mercenary', 'Barbarian', 'Destroyer'),
    ('Swordsman', 'Gladiator', 'Lunar Knight'),
]
_head = """
<div class="navbar-header">
    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
    </button>
</div>

<div class="collapse navbar-collapse">
    <a class="navbar-brand" href="#">Skill Simulator</a>
    <ul class="nav navbar-nav">
"""
_template = """
<li class="dropdown">
    <a href="#" class="dropdown-toggle" data-toggle="dropdown">%s<b class="caret"></b></a>
    <ul class="dropdown-menu">
        <li class="dropdown-header">%s</li>
        <li><a href="%s">%s</a></li>
        <li><a href="%s">%s</a></li>
        <li class="dropdown-header">%s</li>
        <li><a href="%s">%s</a></li>
        <li><a href="%s">%s</a></li>
    </ul>
</li>
"""
_tail = """
    </ul>
</div>
"""

def _hashlink(name, level):
    job = Job.objects.filter(name=name).get()
    return '-' * 60 + '.' + hash_((job.id << 7) | level, 3)


class Command(BaseCommand):
    """Admin command to generate navigation links from model ids."""
    args = '<level> <outfile>'
    help = 'Generates html for navigation based on model ids'

    def handle(self, *args, **options):
        """Command handler."""
        level = int(args[0])
        outfile = args[1]
        assert level<101, 'Level must be an integer between 1 and 100'

        result = _head
        for n in xrange(len(_item)):
            sub0 = _subitem[2*n]
            sub1 = _subitem[2*n+1]
            template_args = (
                _item[n],
                sub0[0],
                _hashlink(sub0[1], level),
                sub0[1],
                _hashlink(sub0[2], level),
                sub0[2],
                sub1[0],
                _hashlink(sub1[1], level),
                sub1[1],
                _hashlink(sub1[2], level),
                sub1[2]
            )
            log.debug(template_args)
            result += _template % template_args
        result += _tail

        with open(outfile, 'w') as f:
            f.write(result)
