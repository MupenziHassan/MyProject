// Add automated interpretation for common vitals if not already set
VitalRecordSchema.pre('save', function(next) {
  // Only interpret if not already done
  if (this.interpretation === 'not_assessed') {
    switch(this.type) {
      case 'blood_pressure':
        if (this.components.systolic && this.components.diastolic) {
          const systolic = this.components.systolic;
          const diastolic = this.components.diastolic;
          
          if (systolic >= 180 || diastolic >= 120) {
            this.interpretation = 'critical_high';
          } else if (systolic >= 140 || diastolic >= 90) {
            this.interpretation = 'high';
          } else if (systolic < 90 || diastolic < 60) {
            this.interpretation = 'low';
          } else {
            this.interpretation = 'normal';
          }
        }
        break;
        
      case 'heart_rate':
        const hr = parseFloat(this.value);
        if (hr > 120) {
          this.interpretation = 'high';
        } else if (hr < 60) {
          this.interpretation = 'low';
        } else {
          this.interpretation = 'normal';
        }
        break;
        
      case 'temperature':
        const temp = parseFloat(this.value);
        if (this.unit === 'celsius' || this.unit === '°C') {
          if (temp >= 39.5) {
            this.interpretation = 'critical_high';
          } else if (temp >= 38) {
            this.interpretation = 'high';
          } else if (temp <= 35) {
            this.interpretation = 'low';
          } else {
            this.interpretation = 'normal';
          }
        } else if (this.unit === 'fahrenheit' || this.unit === '°F') {
          if (temp >= 103) {
            this.interpretation = 'critical_high';
          } else if (temp >= 100.4) {
            this.interpretation = 'high';
          } else if (temp <= 95) {
            this.interpretation = 'low';
          } else {
            this.interpretation = 'normal';
          }
        }
        break;
        
      case 'oxygen_saturation':
        const spo2 = parseFloat(this.value);
        if (spo2 < 90) {
          this.interpretation = 'critical_low';
        } else if (spo2 < 94) {
          this.interpretation = 'low';
        } else {
          this.interpretation = 'normal';
        }
        break;
        
      case 'blood_glucose':
        const glucose = parseFloat(this.value);
        const isFasting = this.components.fasting;
        const isBeforeMeal = this.components.beforeMeal;
        
        if (this.unit === 'mg/dL') {
          if (isFasting || isBeforeMeal) {
            if (glucose > 126) {
              this.interpretation = 'high';
            } else if (glucose < 70) {
              this.interpretation = 'low';
            } else {
              this.interpretation = 'normal';
            }
          } else {
            // After meal
            if (glucose > 200) {
              this.interpretation = 'high';
            } else if (glucose < 70) {
              this.interpretation = 'low';
            } else {
              this.interpretation = 'normal';
            }
          }
        } else if (this.unit === 'mmol/L') {
          if (isFasting || isBeforeMeal) {
            if (glucose > 7.0) {
              this.interpretation = 'high';
            } else if (glucose < 3.9) {
              this.interpretation = 'low';
            } else {
              this.interpretation = 'normal';
            }
          } else {
            // After meal
            if (glucose > 11.1) {
              this.interpretation = 'high';
            } else if (glucose < 3.9) {
              this.interpretation = 'low';
            } else {
              this.interpretation = 'normal';
            }
          }
        }
        break;
    }
  }
  next();
});

// Virtuals
VitalRecordSchema.virtual('isAbnormal').get(function() {
  return ['abnormal', 'critical_high', 'critical_low', 'high', 'low'].includes(this.interpretation);
});

VitalRecordSchema.virtual('isCritical').get(function() {
  return ['critical_high', 'critical_low'].includes(this.interpretation);
});

VitalRecordSchema.virtual('readableValue').get(function() {
  if (this.type === 'blood_pressure' && this.components.systolic && this.components.diastolic) {
    return `${this.components.systolic}/${this.components.diastolic} ${this.unit}`;
  }
  return `${this.value} ${this.unit}`;
});

// Indexes for efficient querying
VitalRecordSchema.index({ patient: 1, type: 1, recordedAt: -1 });
VitalRecordSchema.index({ recordedAt: -1 });
VitalRecordSchema.index({ interpretation: 1 });
VitalRecordSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });

module.exports = mongoose.model('VitalRecord', VitalRecordSchema);
