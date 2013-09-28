#!/usr/bin/python2.7
from dragonnest.settings import STATIC_ROOT
from skills.models import *
from PIL import Image, ImageDraw, ImageFont
import os

_ASCIIMAP = [chr(n) for n in ([45] + range(48, 58) + range(65, 91) + [95] + range(97, 123))]
_ALPHABET = dict(zip(range(64), _ASCIIMAP))
_ALPHABET_REVERSE = dict(zip(_ASCIIMAP, range(64)))


_FONT = ImageFont.truetype(os.path.join(STATIC_ROOT, 'font', 'DejaVuSansCondensed-Bold.ttf'), 10)
_FONT_TITLE = ImageFont.truetype(os.path.join(STATIC_ROOT, 'font', 'DejaVuSansCondensed-Bold.ttf'), 18)

def hash_(num, length):
    result = ''
    while num != 0:
        result += _ALPHABET[num&63]
        num = num>>6
    return result.ljust(length, _ALPHABET[0])

def unhash_(msg):
    result = 0
    for c in msg[::-1]:
        result = (result<<6)|_ALPHABET_REVERSE[c]
    return result

def unhash_build(msg, jobs):
    assert len(msg) == 60
    nums = [ unhash_(msg[n:n+5]) for n in range(0, 60, 5) ]
    num_iter = iter(nums)
    job_iter = iter(jobs)
    result = []

    for n in range(24*len(jobs)):
        if n%6 == 0:
            num = num_iter.next()
        if n%24 == 0:
            job = job_iter.next()
        level = (num>>(25-n%6*5))&31
        try:
            skill = Skill.objects.filter(job=job, tree_index=n%24).get()
        except Skill.DoesNotExist:
            skill = None
        result.append((skill, level))

    return result

def build_img(build_hash, portrait=True):
    num = unhash_(build_hash.split('.')[1])
    assert num > 128
    job = Job.objects.get(id=num>>7)
    level = num&127

    jobs = []
    while True:
        jobs.append(job)
        if not job.parent:
            break
        job = job.parent
    jobs.sort(key=lambda x: x.id)
    slevel = unhash_build(build_hash.split('.')[0], jobs)
    
    iconw = 50                                          # Size of the skill icon
    iconm = 5                                           # Icon margin
    titlem = 10                                         # Job title vertical margin
    titleh = (_FONT_TITLE.getsize('I')[1] + iconm) * 2  # Job title badge height
    gridw = (iconw + iconm) * 4 + iconm                 # Skill icon grid width
    gridh = (iconw + iconm) * 6 + iconm                 # Skill icon grid height
    if portrait:
        img = Image.new('RGBA', (gridw, len(jobs)*gridh), (0,0,0,0))
    else:
        img = Image.new('RGBA', (len(jobs)*gridw, gridh), (0,0,0,0))

    for n in range(len(slevel)):
        if n%24 == 0:
            if portrait:
                x0 = 0
                y0 = (n/24) * (gridh + titleh + 2 * titlem)
            else:
                x0 = (n/24) * gridw
                y0 = 0
            # Draw Job Name
            job = slevel[n][0].job
            job_img = draw_text(job.name, font=_FONT_TITLE)
            w, h = job_img.size
            x = x0 + (gridw - w) / 2 
            img.paste(job_img, (x, y0 + titlem), job_img)
        x = x0 + iconm + (n % 4) * (iconm + iconw)
        y = y0 + titleh + 2 * titlem + (n%24) / 4 * (iconm + iconw)

        if slevel[n][0] is None:
            continue
      
        # Get icon image path
        img_path = slevel[n][0].icon/100
        img_path = 1 if img_path == 0 else img_path
        if slevel[n][1] > 0:
            img_path = os.path.join(STATIC_ROOT, 'img', 'hi', '%d.png'%img_path)
        else:
            img_path = os.path.join(STATIC_ROOT, 'img', 'lo', '%d.png'%img_path)

        # Crop the icon from the imagemap
        cropx = iconw*((slevel[n][0].icon%100)%10)
        cropy = iconw*((slevel[n][0].icon%100)/10)
        box = (cropx, cropy, cropx+iconw, cropy+iconw)
        skill_img = Image.open(img_path).convert('RGBA')
        skill_img = skill_img.crop(box)
        img.paste(skill_img, (x,y), skill_img)
        
        # Draw the skill level badge
        msg = '%d/%d' % (slevel[n][1], SkillLevel.objects.filter(skill=slevel[n][0], required_level__lte=level).count())
        badge_img = draw_text(msg)
        w, h = badge_img.size
        img.paste(badge_img, (x+iconw-w,y+iconw-h), badge_img)

    return img

def draw_text(msg, font=_FONT):
    w, h = font.getsize(msg)
    m = h/2
   
    scale = 16
    bw, bh = (w+h)*scale, h*2*scale
    badge = Image.new('RGBA', (bw, bh), (0,0,0,0)) 
    draw = ImageDraw.Draw(badge)
    draw.pieslice((0,0,bh,bh), 90, 270, fill='#999999')
    draw.pieslice((bw-bh,0,bw,bh), -90, 90, fill='#999999')
    draw.rectangle((bh/2,0,bw-bh/2,bh), fill='#999999')
    badge = badge.resize((w+h,h*2), Image.ANTIALIAS)
    ImageDraw.Draw(badge).text((m, m+1), msg, font=font, fill='#FFFFFF')
    return badge
