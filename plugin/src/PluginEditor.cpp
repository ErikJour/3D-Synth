/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#include "ThreeDPartOne/PluginProcessor.h"
#include "ThreeDPartOne/PluginEditor.h"


namespace {
auto streamToVector (juce::InputStream& stream) {
    using namespace juce;

    std::vector<std::byte> result ((size_t) stream.getTotalLength());
    stream.setPosition (0);
    [[maybe_unused]] const auto bytesRead = stream.read (result.data(), result.size());
    jassert (bytesRead == (ssize_t) result.size());
    return result;
}

const char* getMimeForExtension (const juce::String& extension)
{
    using namespace juce;
    static const std::unordered_map<String, const char*> mimeMap =
    {
        { { "htm"   },  "text/html"                },
        { { "html"  },  "text/html"                },
        { { "txt"   },  "text/plain"               },
        { { "jpg"   },  "image/jpeg"               },
        { { "jpeg"  },  "image/jpeg"               },
        { { "svg"   },  "image/svg+xml"            },
        { { "ico"   },  "image/vnd.microsoft.icon" },
        { { "json"  },  "application/json"         },
        { { "png"   },  "image/png"                },
        { { "css"   },  "text/css"                 },
        { { "map"   },  "application/json"         },
        { { "js"    },  "text/javascript"          },
        { { "woff2" },  "font/woff2"               }
    };

    if (const auto it = mimeMap.find (extension.toLowerCase()); it != mimeMap.end())
        return it->second;

    jassertfalse;
    return "";
}
}

//==============================================================================

namespace ThreeDOne {

NewProjectAudioProcessorEditor::NewProjectAudioProcessorEditor (NewProjectAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p),
    webViewGui{juce::WebBrowserComponent::Options{}
    .withResourceProvider([this](const auto& url){
        return getResource(url);})
        .withNativeIntegrationEnabled()
        .withUserScript(R"(console.log("C++ Backend here: This is run before any other loading happens.");)")
        .withNativeFunction(
            juce::Identifier{"nativeFunction"},
            [this](const juce::Array<juce::var>& args,
            juce::WebBrowserComponent::NativeFunctionCompletion completion){
               nativeFunction(args, std::move(completion)); 
            }
        )},
    midiKeyboardComponent(p.keyboardState, juce::MidiKeyboardComponent::horizontalKeyboard)

{
    juce::ignoreUnused (audioProcessor);


//WebViewGUI

    webViewGui.goToURL("http://localhost:5173/");
    addAndMakeVisible(webViewGui);

//MIDI Keyboard
    addAndMakeVisible(midiKeyboardComponent);
    p.keyboardState.addListener(this);

//Window
setResizable(true, true);         
setSize (800, 600);



}

NewProjectAudioProcessorEditor::~NewProjectAudioProcessorEditor()
{
    audioProcessor.keyboardState.removeListener(this);
}

//==============================================================================

void NewProjectAudioProcessorEditor::resized()
{
    auto bounds = getLocalBounds();

    // Set the WebView GUI to take up the top half of the height
    webViewGui.setBounds(bounds.removeFromTop(bounds.getHeight() * .8f));

    // Set bounds for the keyboard
    midiKeyboardComponent.setBounds(bounds.removeFromBottom(bounds.getHeight()));
}

void NewProjectAudioProcessorEditor::handleNoteOn(juce::MidiKeyboardState*, int midiChannel, int midiNoteNumber, float velocity)
{
 
    juce::MidiMessage m(juce::MidiMessage::noteOn(midiChannel, midiNoteNumber, velocity));
    audioProcessor.handleMidiMessage(m);   

    bool noteOn = true;
    static const juce::Identifier EVENT_ID{"noteOn"};
    webViewGui.emitEventIfBrowserIsVisible(EVENT_ID, noteOn);


}

void NewProjectAudioProcessorEditor::handleNoteOff(juce::MidiKeyboardState*, int midiChannel, int midiNoteNumber, float velocity)
{
    juce::MidiMessage m(juce::MidiMessage::noteOff(midiChannel, midiNoteNumber));
    audioProcessor.handleMidiMessage(m);  
     bool noteOff = true;
    static const juce::Identifier EVENT_ID{"noteOff"};
    webViewGui.emitEventIfBrowserIsVisible(EVENT_ID, noteOff);

}

void NewProjectAudioProcessorEditor::onVelocityChanged(float velocity)
{
    //Update Amplitude of Wave VIA MIDI Velocity

    static const juce::Identifier EVENT_ID{"updateAmplitude"};
    webViewGui.emitEventIfBrowserIsVisible(EVENT_ID, velocity);

}

void NewProjectAudioProcessorEditor::onFrequencyChanged(float frequency)
{
    //Update Frequency of Wave VIA MIDI Velocity

    static const juce::Identifier EVENT_ID{"updateFrequency"};
    webViewGui.emitEventIfBrowserIsVisible(EVENT_ID, frequency);

}


    auto NewProjectAudioProcessorEditor::getResource (const juce::String& url) -> std::optional<Resource> {

    std::cout << url << std::endl;

    static const auto resourceFileRoot = juce::File{R"(/Users/ejourgensen/Desktop/Erik/Programming/Audio Dev/Three_D_Synth/plugin/UI/public)"};

    const auto resourceToRetrieve = url == "/" ? "index.html" : url.fromFirstOccurrenceOf ("/", false, false);

    const auto resource = resourceFileRoot.getChildFile(resourceToRetrieve).createInputStream();

    if (resource){
        const auto extension = resourceToRetrieve.fromLastOccurrenceOf(".", false, false);
        return Resource{streamToVector(*resource), getMimeForExtension(extension)};
    }

    return std::nullopt;
}

void NewProjectAudioProcessorEditor::nativeFunction(const juce::Array<juce::var>& args,
                                                     juce::WebBrowserComponent::NativeFunctionCompletion completion)
{
 if (args.size() == 1 && args[0].isArray()){
        auto* arrayArg = args[0].getArray();
        if (arrayArg != nullptr && arrayArg->size() >= 2)
        {
            std::string paramType = arrayArg->getReference(0).toString().toStdString();
            float value = static_cast<float>(arrayArg->getReference(1));
            bool isLfoOn = static_cast<bool>(arrayArg->getReference(1)); 
            if(paramType == "lfoOn"){
              
                audioProcessor.setTremoloForVoices(isLfoOn);
                completion(true);
                return;
            }
            else if (paramType == "waveShape")
            {
                audioProcessor.setWaveType(static_cast<int>(value));
                completion(true);
            }
        }
    }
                completion(false);
}

}