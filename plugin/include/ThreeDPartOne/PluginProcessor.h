/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin processor.

  ==============================================================================
*/

#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "DSP/synthSound.h"
#include "DSP/synthVoice.h"
#include "DSP/velocityListener.h"
#include "DSP/FrequencyListener.h"

//==============================================================================
/**
*/

namespace ThreeDOne {

class NewProjectAudioProcessor  : public juce::AudioProcessor
{
public:
    
    //==============================================================================
    NewProjectAudioProcessor();
    ~NewProjectAudioProcessor() override;

    //==============================================================================
    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

   #ifndef JucePlugin_PreferredChannelConfigurations
    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;
   #endif

    void handleMidiMessage(const juce::MidiMessage& m);
    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    //==============================================================================
    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    //==============================================================================
    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    //==============================================================================
    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    //==============================================================================
    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

    //==============================================================================
    void setGain(float newGain);
    void setWaveType (int waveType);
    void setVelocityListener(VelocityListener* listener) { velocityListener = listener; }
    void setFrequencyListener(FrequencyListener* listener) { frequencyListener = listener; }

    void setTremoloForVoices (bool isOn);
    
    double gain = 0.001f;
    
    juce::MidiKeyboardState keyboardState;

private:
    
    //Synthesiser
    juce::Synthesiser mySynth;
    double wtSize;
    double frequency;
    double phase;
    double increment;
    int currentWaveType;
    double currentSampleRate;
    VelocityListener* velocityListener = nullptr;
    FrequencyListener* frequencyListener = nullptr;
    
    //==============================================================================
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (NewProjectAudioProcessor)
};
}