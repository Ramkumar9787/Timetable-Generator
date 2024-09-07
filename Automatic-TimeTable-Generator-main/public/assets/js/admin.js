window.onload = function() {
    // Get references to the select elements in the add course form
    var programmeSelect = document.getElementById("programme");
    var streamSelect = document.getElementById("stream");
    
    // Define the streams for each programme
    var streams = {
        "B.E": ["Automobile Engineering", "Biomedical Engineering", "Civil Engineering", "Computer Science and Engineering(AI and ML)", "Computer Science and Engineering", "Electrical and Electronics Engineering", "Electrical and Communication Engineering", "Instrumentation and Control Engineering", "Mechanical Engineering", "Metallurgical Engineering", "Production Engineering", "production Engineering", "Robotics and Automation", "Electrical and Electronics Engineering(Sandwich)", "Mechanical Engineering(Sandwich)", "Production Engineering(Sandwich)"],
        "B.TECH": ["Information Technology", "Fashion Technology", "Textile Technology"],
        "M.E": ["Automotive Engineering", "Biometrics and Cybersecurity", "Computer Science and Engineering", "Control Systems", "Embedded & Real-Time Systems", "Engineering Design", "Industrial Engineering", "Industrial Metallurgy", "Manufacturing Engineering", "Power Electronics and Drives", "Structural Engineering", "VLSI Design"],
        "M.SC": ["Computer Applications", "Fashion Design & Merchandising - 5 Years Integrated", "Applied Mathematics", "Software Systems - 5 Years Integrated", "Theoretical Computer Science - 5 Years Integrated", "Data Science - 5 Years Integrated)", "Cyber Security - Integrated - 5 Years Integrated"],
        "M.TECH": ["Bio Technology", "Nano Science and Technology", "Textile Technology"],
        "B.SC": ["Applied Science", "Computer Systems and Design"],
        "MBA": ["MBA", "Waste Management & Social Entrepreneurship"]
    };
    
    // Function to populate stream options based on selected programme
    function populateStreams() {
        var selectedProgramme = programmeSelect.value;
        // Clear existing options
        streamSelect.innerHTML = "";
        // Add options based on selected programme
        streams[selectedProgramme].forEach(function(stream) {
            var option = document.createElement("option");
            option.text = stream;
            option.value=stream;
            streamSelect.add(option);
        });
    }

    
    // Populate streams when the programme selection changes
    programmeSelect.addEventListener("change", populateStreams);
    
    // Initial population of streams
    populateStreams();
};
