#pragma once

class VelocityListener
{
public:
   VelocityListener() = default;
   virtual ~VelocityListener() = default;
   virtual  void onVelocityChanged(float velocity) = 0;
};