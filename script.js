document.addEventListener('DOMContentLoaded', () => {
    function fetchData() {
        const sheetId = '1pdsaH16ujwRbAs98X-44bWlzZKsWlJmY-_fCyDWNiFM';
        const apiKey = 'AIzaSyDpdoAbYeUhU0CqIW9JegtZ2SpZ_eyAbAI';
        const sheetAsJsonUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;

        const studentsContainer = document.querySelector('.student-grid');
        const popup = document.getElementById('popup');
        const popupClose = document.getElementById('popup-close');

        let isMouseOverPopupOrStudent = false;
        let popupShouldStayClosed = false;

        function closePopup() {
            popup.style.display = 'none';
            popupShouldStayClosed = true;
        }

        axios.get(sheetAsJsonUrl)
            .then(response => {
                const rows = response.data.values;
                const headers = rows[0].map(header => header.toLowerCase().replace(/ /g, '_'));
                const columnIndex = {};
                headers.forEach((header, index) => {
                    columnIndex[header] = index;
                });

                const students = rows.slice(1).map(row => ({
                    name: row[columnIndex.student_name],
                    details: row[columnIndex.details],
                    studentImageUrl: row[columnIndex.headshot_direct_url],
                    activityScreenshotUrl: row[columnIndex.activity_direct_url],
                    activityLink: row[columnIndex.activity_link]
                }));

                students.forEach(student => {
                    const studentElement = document.createElement('div');
                    studentElement.classList.add('student');
                    studentElement.dataset.student = student.name.toLowerCase().replace(/ /g, '-');
                    studentElement.innerHTML = `<img src="${student.studentImageUrl}" alt="${student.name}">`;

                    studentElement.addEventListener('mouseover', () => {
                        if (popupShouldStayClosed) return; // Prevent popup from reopening
                        isMouseOverPopupOrStudent = true;
                        popup.querySelector('.popup-headshot').src = student.studentImageUrl;
                        popup.querySelector('.popup-headshot').alt = student.name;
                        popup.querySelector('.popup-details h3').innerText = student.name;
                        popup.querySelector('.popup-details ul').innerHTML = student.details.split('<br>').map(detail => `<li>${detail}</li>`).join('');
                        popup.querySelector('.popup-activity').src = student.activityScreenshotUrl;
                        popup.querySelector('.popup-activity').alt = `${student.name}'s Activity`;
                        popup.querySelector('.popup-activity').parentElement.href = student.activityLink;
                        popup.style.display = 'block';
                        popup.style.top = '50%';
                        popup.style.left = '50%';
                        popup.style.transform = 'translate(-50%, -50%)';
                    });

                    studentElement.addEventListener('mouseout', () => {
                        isMouseOverPopupOrStudent = false;
                        setTimeout(() => {
                            if (!isMouseOverPopupOrStudent) {
                                popup.style.display = 'none';
                            }
                        }, 300);
                    });

                    studentsContainer.appendChild(studentElement);
                });

                popup.addEventListener('mouseover', () => {
                    isMouseOverPopupOrStudent = true;
                });

                popup.addEventListener('mouseout', () => {
                    isMouseOverPopupOrStudent = false;
                    setTimeout(() => {
                        if (!isMouseOverPopupOrStudent) {
                            popup.style.display = 'none';
                        }
                    }, 300);
                });

                popupClose.addEventListener('click', closePopup);

                // Add event listener for Escape key
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        closePopup();
                    }
                });

                // Reset popupShouldStayClosed flag when mouse enters student grid
                studentsContainer.addEventListener('mouseover', () => {
                    popupShouldStayClosed = false;
                });
            })
            .catch(error => {
                console.error('Error fetching data from Google Sheets:', error);
            });
    }

    if (typeof axios === 'undefined') {
        const axiosScript = document.createElement('script');
        axiosScript.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
        axiosScript.onload = fetchData;
        document.head.appendChild(axiosScript);
    } else {
        fetchData();
    }
});

