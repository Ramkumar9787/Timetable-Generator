function showForm(formId) {
    var forms = document.querySelectorAll('.form');
    forms.forEach(function(form) {
        form.classList.remove('active-form');
    });
    document.getElementById(formId + 'Form').classList.add('active-form');

    // Hide the welcome message only if the form displayed is not the welcome message
    if (formId !== 'welcomeMessage') {
        document.getElementById('welcomeMessage').style.display = 'none';
    } else {
        document.getElementById('welcomeMessage').style.display = 'flex';
    }

    // Call corresponding function to populate dropdowns when form is shown
    if (formId === 'addFaculty') {
        fetchStreams();
        feCourses();
    }
    activateMenuItem(formId);
}
    function activateMenuItem(formId) {
    // Remove active class from all menu items
    $('#menu ul li').removeClass('active');
    // Add active class to the selected menu item
    $('#menu ul li a[href="#' + formId + '"]').parent().addClass('active');
}
