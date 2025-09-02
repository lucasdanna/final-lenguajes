const doctorsList = document.getElementById('doctorsList');
const medicalList = document.getElementById('medicalList');
if (doctorsList && medicalList) {
  fetch('/api/medical.php')
    .then(r=>r.json())
    .then(({doctors, records}) => {
      doctorsList.innerHTML = (doctors||[]).map(d => `
        <div class="border rounded p-3">
          <div class="font-semibold">${d.name}</div>
          <div class="text-sm text-gray-600">${d.specialization}</div>
          <div class="text-xs text-gray-500">Lic: ${d.license_number}</div>
          ${d.phone?`<div class=\"text-xs text-gray-500\">📞 ${d.phone}</div>`:''}
          ${d.email?`<div class=\"text-xs text-gray-500\">✉️ ${d.email}</div>`:''}
        </div>
      `).join('') || '<p class="text-gray-500">Sin médicos registrados.</p>';

      medicalList.innerHTML = (records||[]).map(r => `
        <div class="border rounded p-3">
          <div class="font-semibold">${r.patient_name} (#${r.patient_number})</div>
          <div class="text-sm text-gray-600">Dr. ${r.doctor_name}</div>
          <div class="text-xs text-gray-500">📅 ${new Date(r.visit_date).toLocaleDateString()}</div>
          <div class="text-sm mt-1"><strong>Diagnóstico:</strong> ${r.diagnosis}</div>
          ${r.treatment?`<div class=\"text-sm\"><strong>Tratamiento:</strong> ${r.treatment}</div>`:''}
          ${r.prescription?`<div class=\"text-sm\"><strong>Receta:</strong> ${r.prescription}</div>`:''}
          ${r.next_visit?`<div class=\"text-xs text-blue-600\">🔄 Próxima visita: ${new Date(r.next_visit).toLocaleDateString()}</div>`:''}
        </div>
      `).join('') || '<p class="text-gray-500">Sin registros médicos.</p>';
    })
    .catch(()=>{
      doctorsList.innerHTML = '<p class="text-red-600">No se pudo cargar.</p>';
      medicalList.innerHTML = '';
    });
}

// Enfermería page interactions (placeholder)

