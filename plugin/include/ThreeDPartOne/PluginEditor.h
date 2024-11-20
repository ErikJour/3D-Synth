/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include <juce_audio_utils/juce_audio_utils.h>
#include "ThreeDPartOne/PluginProcessor.h"
#include "DSP/velocityListener.h"
#include "DSP/FrequencyListener.h"

//==============================================================================
/**
*/

namespace ThreeDOne {

class NewProjectAudioProcessorEditor  : public juce::AudioProcessorEditor, 
                                        public juce::MidiKeyboardState::Listener,
                                        public VelocityListener,
                                        public FrequencyListener
{
public:
    explicit NewProjectAudioProcessorEditor (NewProjectAudioProcessor&);
    ~NewProjectAudioProcessorEditor() override;
  
    void resized() override;
    void handleNoteOn (juce::MidiKeyboardState* source, int midiChannel, int midiNoteNumber, float velocity) override;
    void handleNoteOff (juce::MidiKeyboardState* source, int midiChannel, int midiNoteNumber, float velocity) override;
    void onVelocityChanged(float velocity) override;
    void onFrequencyChanged(float frequency) override;

private:

    using Resource = juce::WebBrowserComponent::Resource;  

    std::optional<Resource> getResource (const juce::String& url);

    void nativeFunction (const juce::Array<juce::var>& args,
                         juce::WebBrowserComponent::NativeFunctionCompletion completion);

    juce::WebBrowserComponent webViewGui;
    
    NewProjectAudioProcessor& audioProcessor;

    juce::MidiKeyboardComponent midiKeyboardComponent;


    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (NewProjectAudioProcessorEditor)
};
}
