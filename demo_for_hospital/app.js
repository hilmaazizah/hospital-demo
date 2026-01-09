// DUMMY DATABASE //
const patients = [
  { id: 'MR-00123', name: 'Andi Pratama', phone: '628123456789', status: 'Active' },
  { id: 'MR-00124', name: 'Sarah Wijaya', phone: '087771653033', status: 'Active' }
];

const appointments = [
  { time: '10:00', patient: 'Andi Pratama', phone: '628123456789', doctor: 'Dr. Nahla Shihab', status: 'Scheduled' },
  { time: '13:00', patient: 'Sarah Wijaya', phone: '087771653033', doctor: 'Dr. Patricia Anne', status: 'Scheduled' }
];

const ticket = [
  { id: 'TCK-0091', patient: 'Andi Pratama', phone: '628123456789', issue: 'Billing Inquiry', status: 'Open' },
  { id: 'TCK-0092', patient: 'Sarah Wijaya', phone: '087771653033', issue: 'Doctor Information', status: 'Closed' }
];

let currentPage = '';

let activeCall = {}; // global object, will access from all functions

// NAVIGATION //
function openPage(type) {
  currentPage = type;
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('listPage').style.display = 'block';

  if (type === 'patient') {
  document.getElementById('pageTitle').innerText = '👨🏼‍🦰👩🏼‍🦰 Patient List';
  renderPatients();
}

if (type === 'appointment') {
  document.getElementById('pageTitle').innerText = '📅 Appointment List';
  renderAppointments();
}

if (type === 'ticket') {
  document.getElementById('pageTitle').innerText = '🎫 Ticket List';
  renderTicket();
}
}

function goBack() {
  location.reload();
    document.getElementById('listPage').style.display = 'none';
    document.getElementById('callScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

function openAddForm() {
  console.log("➕ Add New clicked, currentPage =", currentPage);

  document.getElementById("addFormArea").scrollIntoView({ behavior: "smooth" });

  if (currentPage === 'patient') renderAddPatientForm();
  if (currentPage === 'appointment') renderAddAppointmentForm();
  if (currentPage === 'ticket') renderAddTicketForm();
}

// ADD PATIENT
function renderAddPatientForm() {
  document.getElementById("addFormArea").innerHTML = `
    <h3>➕ Add New Patient</h3>

    <label>Name</label>
    <input id="p_name"/>

    <label>Phone</label>
    <input id="p_phone"/>

    <button onclick="submitNewPatient()">💾 Save Patient</button>
  `;
}

function submitNewPatient() {
  const name = document.getElementById("p_name").value;
  const phone = document.getElementById("p_phone").value;

  if (!name || !phone) {
    alert("Name & phone required");
    return;
  }

  savePatient(name, phone);

  alert("✅ Patient saved");
  renderPatients();           // reload table
  document.getElementById("addFormArea").innerHTML = "";
}

//ADD APPOINTMENT
function renderAddAppointmentForm() {
  document.getElementById("addFormArea").innerHTML = `
    <h3>➕ Add Appointment</h3>

    <label>Time</label>
    <input type="datetime-local" id="a_time"/>

    <label>Patient Name</label>
    <input id="a_patient"/>

    <label>Phone</label>
    <input id="a_phone"/>

    <label>Doctor</label>
    <input id="a_doctor"/>

    <button onclick="submitNewAppointment()">💾 Save</button>
  `;
}

function submitNewAppointment() {
  const time = document.getElementById("a_time").value;
  const patient = document.getElementById("a_patient").value;
  const phone = document.getElementById("a_phone").value;
  const doctor = document.getElementById("a_doctor").value;

  const cb = "cb_" + Date.now();
  window[cb] = () => {
    alert("✅ Appointment saved");
    renderAppointments();
    delete window[cb];
  };

  const params = new URLSearchParams({
    action: "createAppointment",
    time,
    patient,
    phone,
    doctor,
    callback: cb
  });

  const s = document.createElement("script");
  s.src = `${API_URL}?${params.toString()}`;
  document.body.appendChild(s);
}

//ADD TICKET (MANUAL ENTRY)
function renderAddTicketForm() {
  document.getElementById("addFormArea").innerHTML = `
    <h3>➕ Add Ticket</h3>

    <label>Patient</label>
    <input id="t_patient"/>

    <label>Phone</label>
    <input id="t_phone"/>

    <label>Issue</label>
    <input id="t_issue"/>

    <button onclick="submitNewTicket()">💾 Save</button>
  `;
}

function submitNewTicket() {
  const cb = "cb_" + Date.now();
  window[cb] = () => {
    alert("✅ Ticket saved");
    renderTicket();
    delete window[cb];
  };

  const params = new URLSearchParams({
    action: "createTicket",
    patient: document.getElementById("t_patient").value,
    phone: document.getElementById("t_phone").value,
    issue: document.getElementById("t_issue").value,
    callback: cb
  });

  const s = document.createElement("script");
  s.src = `${API_URL}?${params.toString()}`;
  document.body.appendChild(s);
}

// HELPER FUNCTIONS // 
function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString; 
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// RENDER FUNCTIONS //
  async function renderPatients() {
    const patientsData = await fetchData('patient');
    let html = `<table>
      <tr><th>ID</th><th>Name</th><th>Phone</th><th>Status</th></tr>`;
    patientsData.forEach(p => {
      html += `<tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.phone} <button class="call-btn" onclick="callWithMiiTel('${p.phone}')">📞</button></td>
        <td>${p.status}</td>
      </tr>`;
    });
    html += `</table>`;
    document.getElementById('listContent').innerHTML = html;
  }

  async function renderAppointments() {
    const appointmentsData = await fetchData('appointment');

    let html = `<table>
      <tr><th>Time</th><th>Patient</th><th>Phone</th><th>Doctor</th><th>Status</th></tr>`;

    appointmentsData.forEach(a => {
      html += `<tr>
        <td>${new Date(a.time).toLocaleString('id-ID', {day: '2-digit',month: '2-digit',year: 'numeric',hour: '2-digit',minute: '2-digit'})} WIB</td>
        <td>${a.patient}</td>
        <td>${a.phone} <button class="call-btn" onclick="callWithMiiTel('${a.phone}')">📞</button></td>
        <td>${a.doctor}</td>
        <td>${a.status}</td>
      </tr>`;
    });

    html += `</table>`;
    document.getElementById('listContent').innerHTML = html;
  }

  async function renderTicket() {
    const ticketData = await fetchData('ticket');

    let html = `<table>
      <tr><th>ID</th><th>Patient</th><th>Phone</th><th>Issue</th><th>Status</th></tr>`;

    ticketData.forEach(t => {
      html += `<tr>
        <td>${t.id}</td>
        <td>${t.patient}</td>
        <td>${t.phone} <button class="call-btn" onclick="callWithMiiTel('${t.phone}')">📞</button></td>
        <td>${t.issue}</td>
        <td>${t.status}</td>
      </tr>`;
    });

    html += `</table>`;
    document.getElementById('listContent').innerHTML = html;
  }

// ACTIVE TICKET FORM RENDER // 
function renderActiveTicketForm(call) {
  let html = `
    <h4>🆕 Active Ticket</h4>

    <p><b>Ticket ID:</b> ${call.sequenceId}</p>
    <p><b>Phone:</b> ${call.phone}</p>

    <label>Status</label><br/>
    <select id="ticketStatus">
      <option value="OPEN">OPEN</option>
      <option value="CLOSED">CLOSED</option>
      <option value="ESCALATE_L2">Escalate L2</option>
      <option value="ESCALATE_L3">Escalate L3</option>
    </select><br/><br/>

    <label>Ticket Type</label><br/>
    <select id="ticketType">
      <option value="">-- Select --</option>
      <option value="Information">Information</option>
      <option value="Request">Request</option>
      <option value="Feedback">Feedback</option>
      <option value="Complaint">Complaint</option>
      <option value="Others">Others</option>
    </select><br/><br/>

    <label>Issue</label><br/>
    <select id="ticketIssue" onchange="handleIssueChange(this.value)">
      <option value="">-- Select --</option>
      <option value="Consultation Appointment">Consultation Appointment</option>
      <option value="MCU">MCU</option>
      <option value="Feedback/Complaint">Feedback / Complaint</option>
      <option value="Other Inquiry">Other Inquiry</option>
      <option value="Emergency">Emergency</option>
    </select><br/><br/>

    <label>Priority</label><br/>
    <select id="ticketPriority">
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select><br/><br/>

    <button onclick="saveTicketForm('${call.sequenceId}')">
      💾 Save Ticket
    </button>
  `;
  
  document.getElementById("activeTicketArea").innerHTML = html;
}

// SAVE TICKET FUNCTION //
function saveTicketForm(sequenceId) {
  const callbackName = "cb_" + Date.now();

  // callback from AppsScript
  window[callbackName] = function (res) {
    console.log("✅ Ticket saved:", res);

    if (res.success) {
      alert("✅ Ticket saved");
      renderCallTicketFromSheet();

      if (
        document.getElementById("ticketIssue").value ===
        "Consultation Appointment"
      ) {
        console.log("➡️ Open appointment page next");
      }
    } else {
      alert("❌ Failed to save ticket");
      console.error(res);
    }

    delete window[callbackName];
  };

  const params = new URLSearchParams({
    action: "createTicket",
    sequence_id: sequenceId,
    patient: activeCall?.patient?.name || "",
    phone: activeCall?.phoneNumber || "",
    status: document.getElementById("ticketStatus").value,
    ticket_type: document.getElementById("ticketType").value,
    issue: document.getElementById("ticketIssue").value,
    priority: document.getElementById("ticketPriority").value,
    recording_url: activeCall?.recordingUrl || "",
    callback: callbackName
  });

  const script = document.createElement("script");
  script.src = `${API_URL}?${params.toString()}`;
  document.body.appendChild(script);
}

// ISSUE CHANGE HANDLER //
function handleIssueChange(issue) {
  console.log("🧭 Issue selected:", issue);

  if (issue === "Consultation Appointment") {
    showAppointmentView();
    renderAppointmentPage();
  } else {
    showTicketView();
  }
}

// CALL SCREEN RENDER //
function renderMatchedPatient(patient) {
  let html = `
    <p><strong>Status:</strong> Existing Patient</p>
    <table>
      <tr><td>ID</td><td>${patient.id}</td></tr>
      <tr><td>Name</td><td>${patient.name}</td></tr>
      <tr><td>Phone Number</td><td>${patient.phone}</td></tr>
      <tr><td>Medical History</td><td>${patient.medicalHistory || '-'}</td></tr>
      <tr><td>Last Doctor</td><td>${patient.lastDoctor || '-'}</td></tr>
      <tr><td>Identity Number</td><td>${patient.identityNumber || '-'}</td></tr>
      <tr><td>Date of Birth</td><td>${formatDate(patient.dateOfBirth)}</td></tr>
      <tr><td>Gender</td><td>${patient.gender || '-'}</td></tr>
      <tr><td>Email</td><td>${patient.email || '-'}</td></tr>
      <tr><td>Address</td><td>${patient.address || '-'}</td></tr>
      <tr><td>Status</td><td>${patient.status || '-'}</td></tr>
    </table>
  `;
  document.getElementById('callPatientArea').innerHTML = html;
}

async function renderCallTicketFromSheet() {
  const allTickets = await fetchData('ticket');

  // filter by phone from incoming call
  const relatedTickets = allTickets.filter(t =>
    normalizePhone(t.phone) === normalizePhone(CURRENT_PHONE)
  );

  console.log("CURRENT_PHONE:", CURRENT_PHONE);
  console.log("Ticket phones:", allTickets.map(t => t.phone));
  
  let html = `<table>
    <tr>
      <th>ID</th>
      <th>Status</th>
      <th>Issue</th>
      <th>Priority</th>
    </tr>`;

  if (relatedTickets.length === 0) {
    html += `
      <tr>
        <td colspan="4">No ticket found for this call</td>
      </tr>`;
  } else {
    relatedTickets.forEach(t => {
      html += `
        <tr>
          <td>${t.id || t.sequence_id}</td>
          <td>${t.status}</td>
          <td>${t.issue || '-'}</td>
          <td>${t.priority || '-'}</td>
        </tr>`;
    });
  }

 function normalizePhone(phone) {
  if (!phone) return "";
  return String(phone)
    .replace(/\D/g, "")     // delete non-numeric
    .replace(/^62/, "0");   // 62xxx → 0xxx
 }

  html += `</table>`;
  document.getElementById('ticketListArea').innerHTML = html;
}

// APPOINTMENT PAGE RENDER //
function renderAppointmentPage() {
  document.getElementById("appointmentPage").innerHTML = `
    <h4>📅 Doctor Schedule</h4>
    <div id="doctorScheduleArea">
      <i>Loading doctor schedule...</i>
    </div>

    <hr />

    <h4>📝 Appointment Form</h4>
    <div id="appointmentFormArea"></div>
  `;

  loadDoctorSchedule();     // take data fromspreadsheet
  renderAppointmentForm(); // render form
}

// APPOINTMENT FORM RENDER //
function renderAppointmentForm() {
  document.getElementById("appointmentFormArea").innerHTML = `
    <label>Appointment Time</label><br/>
    <input type="datetime-local" id="appointmentTime"><br/><br/>

    <label>Patient Name</label><br/>
    <input type="text" value="${activeCall?.patient?.name || ""}" disabled><br/><br/>

    <label>Phone</label><br/>
    <input type="text" value="${activeCall?.phoneNumber || ""}" disabled><br/><br/>

    <label>Doctor</label><br/>
    <select id="appointmentDoctor"></select><br/><br/>

    <label>Status</label><br/>
    <input type="text" value="scheduled" disabled><br/><br/>

    <button onclick="saveAppointment()">💾 Save Appointment</button>
    <button onclick="showTicketView()">⬅️ Back</button>
  `;
}

// LOAD DOCTOR SCHEDULE //
function loadDoctorSchedule() {
  const callbackName = "cb_doctor_" + Date.now();

  window[callbackName] = function (data) {
    console.log("📋 Doctor schedule:", data);

    if (!data || data.length === 0) {
      document.getElementById("doctorScheduleArea").innerHTML =
        "<i>No doctor schedule found</i>";
      return;
    }

    let table = `
      <table border="1" width="100%" cellpadding="6">
        <tr>
          <th>Doctor</th>
          <th>Specialization</th>
          <th>Available Time</th>
          <th>Room Information</th>
          <th>Status</th>
        </tr>
    `;

    const select = document.getElementById("appointmentDoctor");
    select.innerHTML = "";

    data.forEach(d => {
      table += `
        <tr>
          <td>${d.doctor_name}</td>
          <td>${d.specialization}</td>
          <td>${d.start_time} - ${d.end_time}</td>
          <td>${d.room}</td>
          <td>${d.status}</td>
        </tr>
      `;

      const opt = document.createElement("option");
      opt.value = d.doctor_name;
      opt.textContent = d.doctor_name;
      select.appendChild(opt);
    });

    table += "</table>";

    document.getElementById("doctorScheduleArea").innerHTML = table;
    delete window[callbackName];
  };

  const script = document.createElement("script");
  script.src = `${API_URL}?type=schedule_doctor&callback=${callbackName}`;
  document.body.appendChild(script);
}

// SAVE APPOINTMENT FUNCTION //
function saveAppointment() {
  const callbackName = "cb_appt_" + Date.now();

  window[callbackName] = function (res) {
    console.log("📅 Appointment saved:", res);

    if (res.success) {
      alert("✅ Appointment saved");
      showTicketView();
    } else {
      alert("❌ Failed to save appointment");
      console.error(res);
    }

    delete window[callbackName];
  };

  const params = new URLSearchParams({
    action: "createAppointment",
    time: document.getElementById("appointmentTime").value,
    doctor: document.getElementById("appointmentDoctor").value,
    patient: activeCall?.patient?.name || "",
    phone: activeCall?.phoneNumber || "",
    callback: callbackName
  });

  const script = document.createElement("script");
  script.src = `${API_URL}?${params.toString()}`;
  document.body.appendChild(script);
}

// SAVE PATIENT FUNCTION //
function savePatient(name, phone) {
  const cb = "cb_" + Date.now();

  window[cb] = function (res) {
    console.log("✅ saved", res);
    delete window[cb];
  };

  const params = new URLSearchParams({
    action: "createPatient",
    name,
    phone,
    callback: cb
  });

  const script = document.createElement("script");
  script.src = `${API_URL}?${params.toString()}`;
  document.body.appendChild(script);
}


// MIITEL CALL FUNCTION //
function callWithMiiTel(phoneNumber) {
  if (!window.miitelWidget) {
    alert('MiiTel widget not ready');
    return;
  }
  miitelWidget.call(phoneNumber);
}

// FAKE INCOMING CALL LOGIC //
function simulateIncomingCall(phoneNumber) {
  alert("📞 Incoming call from " + phoneNumber);

  // HIDE DASHBOARD
  document.querySelector('.container').style.display = 'none';

  // HIDE LIST PAGE (if open))
  document.getElementById('listPage').style.display = 'none';

  // SHOW CALL SCREEN
  document.getElementById('callScreen').style.display = 'block';

  // LOAD DATA
  handleIncomingCall(phoneNumber);
  renderCallTicketFromSheet();
}

// INCOMING CALL HANDLER //
async function handleIncomingCall(phoneNumber) {
    CURRENT_PHONE = phoneNumber; 
    console.log("✅ CURRENT_PHONE SET:", CURRENT_PHONE);
    // reset activeCall
    activeCall = { phoneNumber };

    // hide dashboard
    document.querySelector('.container').style.display = 'none';
    document.getElementById('listPage').style.display = 'none';

    // show call screen
    document.getElementById('callScreen').style.display = 'block';

    // fetch patient detail dari sheet baru
    const patientDetail = await fetchPatientDetail(phoneNumber);

    if (patientDetail) {
        activeCall.patient = patientDetail;
        renderMatchedPatient(patientDetail); // view full detail
    } else {
        activeCall.patient = null;
        renderNewPatientForm(phoneNumber); // form input new patient
    }

    renderCallTicketFromSheet(); // 1️⃣ ticket old list (already exists)

    renderActiveTicketForm({ // 2️⃣ active ticket form (NEWLY ADDED)
        phone: phoneNumber,
        sequenceId: "TEMP-" + Date.now()
    });
}

function renderNewPatientForm(phoneNumber) {
  let html = `
    <p><strong>Status:</strong> New Patient</p>

    <label>Name</label><br/>
    <input type="text" id="newPatientName"><br/><br/>

    <label>Phone</label><br/>
    <input type="text" value="${phoneNumber}" disabled><br/><br/>

    <label>Identity Number</label><br/>
    <input type="text" id="newIdentityNumber"><br/><br/>

    <label>Date of Birth</label><br/>
    <input type="text" id="newDateOfBirth"><br/><br/>

    <label>Gender</label><br/>
    <input type="text" id="newGender"><br/><br/>

    <label>Email</label><br/>
    <input type="text" id="newEmail"><br/><br/>

    <label>Address</label><br/>
    <input type="text" id="newAddress"><br/><br/>

    <button onclick="saveNewPatient('${phoneNumber}')">➕ Save Patient</button>
  `;
  document.getElementById('callPatientArea').innerHTML = html;
}

function saveNewPatient(phoneNumber) {
  const name = document.getElementById('newPatientName').value;
  const identityNumber = document.getElementById('newIdentityNumber').value;
  const dob = document.getElementById('newDateOfBirth').value;
  const gender = document.getElementById('newGender').value;
  const email = document.getElementById('newEmail').value;
  const address = document.getElementById('newAddress').value;

  if (!name) {
    alert("Name required");
    return;
  }

  const cb = "cb_" + Date.now();

  window[cb] = function (res) {
    console.log("✅ Patient saved to sheet:", res);

    if (res.success) {
      alert("✅ Patient saved");
      fetchPatientDetail(phoneNumber).then(p => {
        activeCall.patient = p;
        renderMatchedPatient(p);
      });
    } else {
      alert("❌ Failed to save patient");
    }

    delete window[cb];
  };

  const params = new URLSearchParams({
    action: "createPatient",
    name,
    phone: phoneNumber,
    identity_number: identityNumber,
    date_of_birth: dob,
    gender,
    email,
    address,
    callback: cb
  });

  const script = document.createElement("script");
  script.src = `${API_URL}?${params.toString()}`;
  document.body.appendChild(script);


  renderMatchedPatient(newPatient);
  renderCallTicketFromSheet(); // ⬅️ refresh ticket with patient
}

// GLOBAL CONFIG //
const API_URL = "https://script.google.com/macros/s/AKfycbzcbrzFsUbG8Q3WsX2wZ6JyMLvuMzyonU4IXMLgwzItJ7Hv6EhKE0DH7CXnReZUhTm7qg/exec";

let CURRENT_PHONE = null;
let CURRENT_SEQUENCE_ID = null;

// CREATE TICKET FUNCTION //
function createTicket(sequenceId, recordingUrl) {
  const callbackName = "ticket_cb_" + Date.now();
  const script = document.createElement("script");

  window[callbackName] = function (res) {
    console.log("✅ Ticket created:", res);
    delete window[callbackName];
    if (script.parentNode) script.parentNode.removeChild(script);
  };

  script.src =
    `${API_URL}?type=ticket` +
    `&sequence_id=${sequenceId}` +
    `&phone=${CURRENT_PHONE}` +
    `&recording_url=${encodeURIComponent(recordingUrl)}` +
    `&callback=${callbackName}`;

  document.body.appendChild(script);
}

// DEBUG CHECK//
console.log("API URL:", API_URL);

// MIITEL SEQUENCE ID HANDLER //
function receiveSequenceId(e) {
  CURRENT_SEQUENCE_ID = e.sequenceId;

  const COMPANY_ID = "mayapada-id"; //
  const recordingUrl = `https://${COMPANY_ID}.miitel.jp/app/calls/${e.sequenceId}`;

  console.log("📞 Incoming Call Sequence ID:", e.sequenceId);
  console.log("📞 Current Phone:", CURRENT_PHONE);
  console.log("🔗 Recording URL:", recordingUrl);
}

// Register callback to MiiTel widget
if (window.miitelWidget) {
  miitelWidget("onReceiveSequenceId", receiveSequenceId);
}


// FETCH DATA DARI GOOGLE SHEET //
  async function fetchData(sheetType) {
    try {
      const response = await fetch(`${API_URL}?type=${sheetType}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
  // FETCH PATIENT DETAIL DARI SPREADSHEET //
  async function fetchPatientDetail(phoneNumber) {
    try {
        const response = await fetch(`${API_URL}?type=patient_detail&phone=${phoneNumber}`);
        const data = await response.json();
        console.log("Fetched patient detail:", data);
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error("Error fetching patient detail:", error);
        return null;
    }
}

function showTicketView() {
  document.getElementById("callTicketArea").style.display = "block";
  document.getElementById("appointmentPage").style.display = "none";
}

function showAppointmentView() {
  document.getElementById("callTicketArea").style.display = "none";
  document.getElementById("appointmentPage").style.display = "block";
}