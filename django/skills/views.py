from django.core import serializers
from django.http import HttpResponse, Http404
from django.views.generic import View
from skills import utils
from skills.models import Job, Skill, SkillLevel
import logging
log = logging.getLogger('command')


def _set_access_control_headers(response):
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'OPTIONS, GET'
    response['Access-Control-Max-Age'] = '1000'
    response['Access-Control-Allow-Headers'] = '*'
    return response


class JSONView(View):

    def get(self, request, *args, **kwargs):
        num = utils.unhash_(kwargs['hash'].split('.')[1])
        try:
            assert num > 128
            job = Job.objects.get(id=num >> 7)
            level = num & 127
        except:
            raise Http404

        jobs = []
        skills = []
        slevels = []
        while True:
            skills_ = Skill.objects.filter(job=job).all()
            slevels_ = SkillLevel.objects.filter(
                skill__job=job,
                required_level__lte=level).all()
            sleveln_ = SkillLevel.objects.filter(
                skill__job=job,
                required_level__gt=level).\
                order_by('skill', 'required_level').\
                distinct('skill').all()
            jobs.insert(0, job)
            skills.extend(skills_)
            slevels.extend(slevels_)
            slevels.extend(sleveln_)
            if not job.parent:
                break
            job = job.parent

        response = serializers.serialize('json', jobs + skills + slevels)
        httpresponse = HttpResponse(
            response,
            {'content_type': 'application/json'})
        return _set_access_control_headers(httpresponse)


class ImageView(View):

    def get(self, request, *args, **kwargs):
        try:
            portrait = kwargs['orientation'] == 'portrait'
            img = utils.build_img(kwargs['hash'], portrait)
        except Exception as e:
            log.debug(e)
            raise Http404

        response = HttpResponse(mimetype='image/png')
        response['Content-Disposition'] = 'attachment; filename=%s.png' % kwargs['hash']
        img.save(response, 'PNG')
        return response
