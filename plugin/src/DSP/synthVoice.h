/*
  ==============================================================================

    synthVoice.h
    Created: 20 May 2024 2:08:07pm
    Author:  Erik Jourgensen

  ==============================================================================
*/
#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include "synthSound.h"
#include "waveGenerator.h"
#include "lfo.h"

class SynthVoice : public juce::SynthesiserVoice

{
public:
    
    //==============================================================================
    
    SynthVoice() : mWaveGenerator(), mAmplitude(0.25), mFrequency(440.0), isActive(false), sampleRate(44100.0), adsr() {

    adsr.setParameters(adsrParams);
    

    }
    
    ~SynthVoice() override = default;
    
    //==============================================================================

    bool canPlaySound(juce::SynthesiserSound* sound) override
    {
        return dynamic_cast<SynthSound*>(sound) != nullptr;
    
    }
    //==========================================================================


    void setADSRSampleRate (double sampleRate)
    {
        adsr.setSampleRate(sampleRate);
    }

     void setTremoloSampleRate (double sampleRate)
    {
        mTremolo.setSampleRate(sampleRate);
    }


    void setADSRParams (float attack, float sustain, float release)
    {
        adsrParams.attack = 0.9;
        adsrParams.decay = 0.3;
        adsrParams.sustain = 0;
        adsrParams.release = 0.3;
        
    }

    void startNote(int midiNoteNumber, float velocity, juce::SynthesiserSound* sound, int currentPitchWheelPosition) override
    {

         adsr.setParameters(adsrParams);

        if (adsr.isActive())
        {
                adsr.noteOff();
        }
        
        setModulationParams();
        
       
        mFrequency = juce::MidiMessage::getMidiNoteInHertz(midiNoteNumber);

        mAmplitude = velocity;
        mWaveGenerator.setFrequency(mFrequency, sampleRate);
        mWaveGenerator.resetPhase();

        isActive = true;
        adsr.noteOn();
    }
    
    void stopNote (float velocity, bool allowTailoff) override
{
    adsr.noteOff();

    if (!allowTailoff)
    {
        clearCurrentNote();
        isActive = false;
    }
}
    //==========================================================================
    void pitchWheelMoved (int newPitchWheelValue) override
    { 
    }
    
    void controllerMoved (int controllerNumber, int newControllerValue) override
    { 
    }
    //==========================================================================

    void setModulationParams()
    {
            mTremolo.setSampleRate(sampleRate);
            mTremolo.setRate(0.3f);
            mTremolo.setDepth(1.0f);
    }
    
    void renderNextBlock (juce::AudioBuffer<float> &outputBuffer, int startSample, int numSamples) override
    {

        adsr.setParameters(adsrParams);

        if (!isActive)
            return;
        
        float* channelDataLeft = outputBuffer.getWritePointer(0, startSample);
        float* channelDataRight = outputBuffer.getWritePointer(1, startSample);

          
        
        for (int sample = 0; sample < numSamples; ++sample)
        {
            float quietDown = 0.05f;

            float tremoloSample = mTremolo.getNextSample();

            float waveSample = mWaveGenerator.getNextSample() * mAmplitude * quietDown;

            float modulatedSample = waveSample * tremoloSample;

            if (tremoloOn)
            {
                modulatedSample *= adsr.getNextSample();
                channelDataLeft[sample] = modulatedSample;
                channelDataRight[sample] = modulatedSample;
            }

            else 

            { 
                waveSample *= adsr.getNextSample();
                channelDataLeft[sample] = waveSample;
                channelDataRight[sample] = waveSample;

            }

            
            if (!adsr.isActive())
            {
                clearCurrentNote();
                isActive = false;
                break;
            }
            
        }

    }
    
    void updateWaveType (int newWaveType)
    {
        mWaveGenerator.setWaveType(static_cast<WaveGenerator::WaveType>(newWaveType));
    }

    void setTremolo (bool isOn)
    {
        tremoloOn = isOn;
       
    }
    
    
    //==========================================================================
    
    
private:
    WaveGenerator mWaveGenerator;
    
    double mAmplitude;
    double mFrequency;
    bool isActive;
    double sampleRate;

    juce::ADSR adsr;
    juce::ADSR::Parameters adsrParams;

    LFO mTremolo;

    bool tremoloOn = false;



    
};
