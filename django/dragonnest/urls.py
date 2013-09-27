from django.conf.urls import patterns, include, url
from skills.views import JSONView, ImageView
from django.views.generic import TemplateView

urlpatterns = patterns('',
    url(r'^(?P<orientation>landscape|portrait)/(?P<hash>[0-9A-Za-z\-_]+\.[0-9A-Za-z\-_]+)$', ImageView.as_view() ),
    url(r'^api/(?P<hash>[0-9A-Za-z\-_]*)', JSONView.as_view(), name='api'),
    url(r'^(?P<hash>[0-9A-Za-z\-_]+\.[0-9A-Za-z\-_]+)', TemplateView.as_view(template_name = 'layout_collapse.html')),
    url(r'^', TemplateView.as_view(template_name = 'layout_collapse.html')),
)
