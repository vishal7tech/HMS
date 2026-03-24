const axios = require('axios');

async function testOverlap() {
    try {
        console.log("Starting backend overlap test...");

        // 1. We assume the backend is running on 8080 (must be started first)
        // Actually, I just need to write the test script here. Let's make it robust.
        const api = axios.create({ baseURL: 'http://localhost:8080/api' });

        // First login to get token
        const loginRes = await api.post('/auth/login', { username: 'admin@hms.com', password: 'password' });
        const token = loginRes.data.token;
        console.log("Got token");
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0); // 10:00 AM

        const endDate = new Date(tomorrow);
        endDate.setHours(11, 0, 0, 0); // 11:00 AM

        console.log("Attempting to book first appointment...");
        // 2. We'll attempt to book an appointment
        const validBooking = await api.post('/appointments', {
            patientId: 1, // assume patient 1 exists
            doctorId: 1,  // assume doctor 1 exists
            dateTime: tomorrow.toISOString(),
            endTime: endDate.toISOString(),
            reason: "Test booking"
        });
        console.log("First appointment booked successfully:", validBooking.data.id);

        console.log("Attempting overlapping appointment...");
        // 3. We'll attempt an overlapping booking
        try {
            const overlapDate = new Date(tomorrow);
            overlapDate.setHours(10, 30, 0, 0); // 10:30 AM (overlaps with 10:00 - 11:00)
            const overlapEnd = new Date(tomorrow);
            overlapEnd.setHours(11, 30, 0, 0); // 11:30 AM

            await api.post('/appointments', {
                patientId: 1,
                doctorId: 1,
                dateTime: overlapDate.toISOString(),
                endTime: overlapEnd.toISOString(),
                reason: "Test overlap booking"
            });
            console.log("FAILED: Overlap was allowed!");
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log("SUCCESS: Overlap was correctly blocked with error:", err.response.data);
            } else {
                console.log("FAILED with unexpected error:", err.message);
            }
        }
    } catch (error) {
        console.error("Test execution failed:", error.response ? error.response.data : error.message);
    }
}

testOverlap();
