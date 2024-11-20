#pragma once

class LFO
{
    public:
    static constexpr float twoPi = 6.28318530718;

    LFO();
    ~LFO();

         void reset();
         void setSampleRate(double inSampleRate);
         void setRate( float newRate);
         void setDepth( float newDepth);
         float getNextSample();

    private:
        double mSampleRate;
        float mPhase;
        float mRate;
        float mDepth;
        
};