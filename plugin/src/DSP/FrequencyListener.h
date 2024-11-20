#pragma once

class FrequencyListener
{
public:
   FrequencyListener() = default;
   virtual ~FrequencyListener() = default;
   virtual  void onFrequencyChanged(float frequency) = 0;
};