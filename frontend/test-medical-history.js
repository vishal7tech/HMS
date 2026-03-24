// Test script to verify Medical History component functionality
// This can be run in the browser console to test the component

const testMedicalHistory = () => {
  console.log('Testing Medical History component...');
  
  // Test 1: Check if component renders
  const medicalHistoryElement = document.querySelector('[data-testid="medical-history"]');
  if (medicalHistoryElement) {
    console.log('✅ Medical History component renders');
  } else {
    console.log('❌ Medical History component not found');
  }
  
  // Test 2: Check if upload section exists
  const uploadSection = document.querySelector('#file-upload');
  if (uploadSection) {
    console.log('✅ Upload section exists');
  } else {
    console.log('❌ Upload section not found');
  }
  
  // Test 3: Check if prescriptions section exists
  const prescriptionsSection = document.querySelector('[data-testid="prescriptions"]');
  if (prescriptionsSection) {
    console.log('✅ Prescriptions section exists');
  } else {
    console.log('❌ Prescriptions section not found');
  }
  
  console.log('Test completed!');
};

// Export for use in browser console
window.testMedicalHistory = testMedicalHistory;
