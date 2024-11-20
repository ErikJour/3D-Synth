#include "lfo.h"
#include <juce_audio_basics/juce_audio_basics.h>

LFO::LFO() 
{
    reset();
}

LFO::~LFO()
{

}

void LFO::reset()
{
    mPhase = 0.0f;
}

void LFO::setSampleRate(double inSampleRate)
{
    mSampleRate = inSampleRate;     
}

void LFO::setRate (float newRate)
{
    mRate = newRate;
}

void LFO::setDepth (float newDepth)
{
    mDepth = newDepth;
}

float LFO::getNextSample ()
{

    jassert (mSampleRate > 0.0f);
    
    const float lfoRate = juce::jmap(mRate, 0.0f, 1.0f, 0.1f, 10.0f);

    const float phaseIncrement = lfoRate / mSampleRate;

    float lfoValue = mDepth * std::sin(mPhase * twoPi);

    mPhase += phaseIncrement;

    if (mPhase >=1.0f)
    {
        mPhase -= 1.0f;
    }

    return lfoValue;
}

