function openAppointment() {
    document.getElementById("appointmentModal").style.display = "block";
}

function closeAppointment() {
    document.getElementById("appointmentModal").style.display = "none";
}

window.onclick = function(event) {

    const modal = document.getElementById("appointmentModal");

    if (event.target == modal) {
        modal.style.display = "none";
    }
}