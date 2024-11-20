/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin processor.

  ==============================================================================
*/

#include "ThreeDPartOne/PluginProcessor.h"
#include "ThreeDPartOne/PluginEditor.h"
#include <cmath>

//==============================================================================

namespace ThreeDOne { 

NewProjectAudioProcessor::NewProjectAudioProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
     : AudioProcessor (BusesProperties()
                     #if ! JucePlugin_IsMidiEffect
                      #if ! JucePlugin_IsSynth
                       .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                      #endif
                       .withOutput ("Output", juce::AudioChannelSet::stereo(), true)
                     #endif
                       )
#endif
{
    
    mySynth.clearVoices();
    for (int i = 0; i < 6; ++i)
    {
    mySynth.addVoice (new SynthVoice());
    }
//    
    mySynth.clearSounds();
    mySynth.addSound (new SynthSound());
    setGain(-60.0f);
    
}

NewProjectAudioProcessor::~NewProjectAudioProcessor()
{
}

//==============================================================================
const juce::String NewProjectAudioProcessor::getName() const
{
    juce::String pluginName = "Three-D One";
    return pluginName;
}

bool NewProjectAudioProcessor::acceptsMidi() const
{
   #if JucePlugin_WantsMidiInput
    return true;
   #else
    return false;
   #endif
}

bool NewProjectAudioProcessor::producesMidi() const
{
   #if JucePlugin_ProducesMidiOutput
    return true;
   #else
    return false;
   #endif
}

bool NewProjectAudioProcessor::isMidiEffect() const
{
   #if JucePlugin_IsMidiEffect
    return true;
   #else
    return false;
   #endif
}

double NewProjectAudioProcessor::getTailLengthSeconds() const
{
    return 0.0;
}

int NewProjectAudioProcessor::getNumPrograms()
{
    return 1;   // NB: some hosts don't cope very well if you tell them there are 0 programs,
                // so this should be at least 1, even if you're not really implementing programs.
}

int NewProjectAudioProcessor::getCurrentProgram()
{
    return 0;
}

void NewProjectAudioProcessor::setCurrentProgram (int index)
{
}

const juce::String NewProjectAudioProcessor::getProgramName (int index)
{
    return {};
}

void NewProjectAudioProcessor::changeProgramName (int index, const juce::String& newName)
{
}

//==============================================================================
void NewProjectAudioProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{

    currentSampleRate = sampleRate;
    
    mySynth.setCurrentPlaybackSampleRate(sampleRate);
    
    for (int i = 0; i < mySynth.getNumVoices(); ++i)
    {
        if (auto voice = dynamic_cast<SynthVoice*>(mySynth.getVoice(i)))
        {
            voice->setCurrentPlaybackSampleRate(sampleRate);
            voice->updateWaveType(currentWaveType);
        }
    }
}

void NewProjectAudioProcessor::releaseResources()
{

}

#ifndef JucePlugin_PreferredChannelConfigurations
bool NewProjectAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
  #if JucePlugin_IsMidiEffect
    juce::ignoreUnused (layouts);
    return true;
  #else
 
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
     && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

    // This checks if the input layout matches the output layout
   #if ! JucePlugin_IsSynth
    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;
   #endif

    return true;
  #endif
}
#endif

void NewProjectAudioProcessor::handleMidiMessage(const juce::MidiMessage& m)
{
    if (m.isNoteOn())
    {
        float velocity = m.getVelocity() * 127.0f;
        float baseFrequency = juce::MidiMessage::getMidiNoteInHertz(m.getNoteNumber());
        float adjustedFrequency = std::log2(baseFrequency) * baseFrequency;

        if (velocityListener != nullptr)
        {
            velocityListener->onVelocityChanged(velocity);
        }

         if (frequencyListener != nullptr)
        {
            frequencyListener->onFrequencyChanged(adjustedFrequency);
        }
        mySynth.noteOn(m.getChannel(), m.getNoteNumber(), m.getVelocity());
    }
    else if (m.isNoteOff())
    {
        mySynth.noteOff(m.getChannel(), m.getNoteNumber(), m.getVelocity(), true);

    }
     else if (m.isAllNotesOff())
    {
        mySynth.allNotesOff(m.getChannel(), true);

    }
   
}


void NewProjectAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{  
    juce::ScopedNoDenormals noDenormals;
    
    auto totalNumOutputChannels = getTotalNumOutputChannels();
    
    for (auto i = 0; i < totalNumOutputChannels; ++i)
        buffer.clear(i, 0, buffer.getNumSamples());
    
    mySynth.renderNextBlock(buffer, midiMessages, 0, buffer.getNumSamples());

    keyboardState.processNextMidiBuffer(midiMessages, 0, midiMessages.getNumEvents(), false);

    gain = 0.3f;
    
    buffer.applyGain(gain);
}

//==============================================================================
bool NewProjectAudioProcessor::hasEditor() const
{
    return true; 
}

juce::AudioProcessorEditor* NewProjectAudioProcessor::createEditor()
{
    auto* editor = new NewProjectAudioProcessorEditor(*this);
    setVelocityListener(editor);
    setFrequencyListener(editor); 
    return editor;
}

//==============================================================================
void NewProjectAudioProcessor::getStateInformation (juce::MemoryBlock& destData)
{
   
}

void NewProjectAudioProcessor::setStateInformation (const void* data, int sizeInBytes)
{
   
}

void NewProjectAudioProcessor::setWaveType(int waveType)
{
    currentWaveType = waveType;
    
    for (int i = 0; i < mySynth.getNumVoices(); ++i)
    {
        if (auto voice = dynamic_cast<SynthVoice*>(mySynth.getVoice(i)))
        {
            voice->updateWaveType(currentWaveType);
        }
    }
}

void NewProjectAudioProcessor::setGain(float newGain)
{
    gain = std::pow(10.0f, newGain / 20.0f);
    
}

void NewProjectAudioProcessor::setTremoloForVoices (bool isOn)
{
    for (int i = 0; i < mySynth.getNumVoices(); ++i)
    {
        if (auto* voice = dynamic_cast<SynthVoice*>(mySynth.getVoice(i)))
        {
            voice->setTremolo(isOn);  // Set tremolo on each voice
        }
    }
}


}
//==============================================================================
// This creates new instances of the plugin..
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new ThreeDOne::NewProjectAudioProcessor();
}
