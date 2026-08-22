document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('riskChart');
    if (!ctx) return; // Prevents error if canvas is not found
    
    const chartContext = ctx.getContext('2d');
    const statusText = document.getElementById('chartStatus');
    
    const students = JSON.parse(localStorage.getItem('eduTrack_students')) || [];

    let highRisk = 0;   
    let mediumRisk = 0; 
    let onTrack = 0;    

    if (students.length > 0) {
        students.forEach(stu => {
            if (stu.attendance < 75) highRisk++;
            else if (stu.attendance < 85) mediumRisk++;
            else onTrack++;
        });
        statusText.innerText = `Analyzing data for ${students.length} student(s).`;
    } else {
        statusText.innerText = "No student data found. Go to 'Manage Students' to add data.";
    }

    new Chart(chartContext, {
        type: 'doughnut', 
        data: {
            labels: ['High Risk (<75%)', 'Medium Risk (75-84%)', 'On Track (85%+)'],
            datasets: [{
                data: [highRisk, mediumRisk, onTrack],
                backgroundColor: ['#dc3545', '#ffc107', '#198754'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
});