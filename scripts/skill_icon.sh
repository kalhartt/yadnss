#!/bin/bash


# ICONDIR   Directory containing the dds files
# ICONLIST  Array of dds filenames, the _b 'lo' files will be generated from this also
# ICONNAME  The output name prefix for an icon file
# ICONROWS  Number of non-blank rows in the icon file, used to calculate image height
# ICONALPHA If 1, we must apply alpha channel enhancements

ICONDIR=./
ICONLIST=(skillicon01.dds skillicon02.dds skillicon03.dds skillicon04.dds skillicon08.dds skillicon09.dds)
ICONNAME=(1 2 4 6 14 16)
ICONROWS=(10 8 9 10 8 9)
ICONALPHA=(0 0 0 0 1 1)
OUTDIR=img

##########
# Directory Setup
##########
if [ -d $OUTDIR ]; then
    rm -rf img/*
    mkdir img/{hi,lo}
else
    mkdir -p img/{hi,lo}
fi

##########
# Convert images
##########
LEN=${#ICONLIST[@]}
for (( i=0; i<${LEN}; i++ )); do
    hi=${ICONLIST[$i]}
    lo=${ICONLIST[$i]/.dds/_b.dds}
    height=$(expr ${ICONROWS[$i]} \* 50)
    alpha=""

    if [ ${ICONALPHA[$i]} -eq 1 ]; then
        alpha="-channel Alpha -evaluate subtract 50%"
    fi

    if [ "$1" == "split" ]; then
        convert $hi -crop 500x${height}+0x0 +repage $OUTDIR/temp.png
        convert $OUTDIR/temp.png -crop 50x50 +repage $OUTDIR/hi/${ICONNAME[$i]}%02d.png
        convert $lo $alpha -crop 500x${height}+0x0 +repage $OUTDIR/temp.png
        convert $OUTDIR/temp.png -crop 50x50 +repage $OUTDIR/lo/${ICONNAME[$i]}%02d.png
    else
        convert $hi -crop 500x${height}+0x0 +repage $OUTDIR/hi/${ICONNAME[$i]}.png
        convert $lo $alpha -crop 500x${height}+0x0 +repage $OUTDIR/lo/${ICONNAME[$i]}.png
    fi
done
