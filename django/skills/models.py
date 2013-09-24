from django.db import models


class Job(models.Model):
    """Model for DragonNest Job class."""
    name = models.CharField(max_length=255)
    number = models.IntegerField()
    parent = models.ForeignKey('self', null=True, blank=True)


class Skill(models.Model):
    """Model for DragonNest skill."""
    icon = models.IntegerField()
    job = models.ForeignKey(Job)
    name = models.CharField(max_length=255)
    description = models.TextField()
    parent_1 = models.ForeignKey('SkillLevel', null=True, blank=True, related_name='+')
    parent_2 = models.ForeignKey('SkillLevel', null=True, blank=True, related_name='+')
    parent_3 = models.ForeignKey('SkillLevel', null=True, blank=True, related_name='+')
    sp_required_0 = models.IntegerField(default=0)
    sp_required_1 = models.IntegerField(default=0)
    sp_required_2 = models.IntegerField(default=0)
    tree_index = models.IntegerField(default=None, null=True)
    ultimate = models.BooleanField(default=False)


class SkillLevel(models.Model):
    """Model with information about a given skill at a given level."""
    level = models.IntegerField()
    mp_cost_pve = models.FloatField(default=0)
    mp_cost_pvp = models.FloatField(default=0)
    cooldown_pve = models.FloatField(default=0)
    cooldown_pvp = models.FloatField(default=0)
    description_params_pve = models.TextField()
    description_params_pvp = models.TextField()
    required_level = models.IntegerField()
    skill = models.ForeignKey(Skill)
    sp_cost = models.IntegerField()
    sp_cost_cumulative = models.IntegerField()
