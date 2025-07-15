// Анимация появления
const faders = document.querySelectorAll('.fade-in');
const io = new IntersectionObserver(
  entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('appear')),
  { threshold: 0.2 }
);
faders.forEach(el => io.observe(el));

// Валидация формы Netlify
const form = document.getElementById('request-form');
const status = document.getElementById('form-status');
const errName = document.getElementById('error-name');
const errMail = document.getElementById('error-email');
const errMsg  = document.getElementById('error-message');

form.addEventListener('submit', e => {
  errName.textContent = errMail.textContent = errMsg.textContent = '';
  if (!form.name.value.trim())   { errName.textContent  = 'Naam is verplicht';   e.preventDefault(); }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(form.email.value.trim())) { errMail.textContent = 'Ongeldig e-mailadres'; e.preventDefault(); }
  if (!form.message.value.trim()) { errMsg.textContent = 'Bericht is verplicht'; e.preventDefault(); }
  // Если ошибок нет — форма отправится, и Netlify сделает редирект
});

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.diensten-buttons button');
  const bericht = document.querySelector('textarea[name="message"]');

  // helper: маленькая первая буква
  const lcFirst = str => str.charAt(0).toLowerCase() + str.slice(1);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');

      const selected = Array.from(buttons)
        .filter(b => b.classList.contains('active'))
        .map(b => lcFirst(b.dataset.service));   // ← тут lowercase first

      // формируем строку c «en»
      let dienstenText = '';
      if (selected.length === 1) {
        dienstenText = selected[0];
      } else if (selected.length === 2) {
        dienstenText = selected.join(' en ');
      } else if (selected.length > 2) {
        const last = selected.pop();
        dienstenText = selected.join(', ') + ' en ' + last;
      }

      // убираем старое «Ik wil …»:
      const extraText = bericht.value.replace(/^Ik wil .+\.\s*/i, '').trim();
      bericht.value = dienstenText
        ? `Ik wil ${dienstenText}.` + (extraText ? '\n' + extraText : '')
        : extraText;
    });
  });
});

