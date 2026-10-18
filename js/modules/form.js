// Profile editor in a <dialog>: name, birth date/time, place search or manual coordinates.
import { el } from './dom.js';
import { searchPlace } from './geocode.js';
import { validateProfile } from './profiles.js';

export function openProfileForm(dialog, profile, { onSave, onDelete }) {
  let place = profile
    ? { label: profile.place, latitude: profile.latitude, longitude: profile.longitude, timeZone: profile.timeZone }
    : null;

  const name = el('input', { id: 'f-name', required: true, maxlength: '40', value: profile?.name ?? '' });
  const date = el('input', { id: 'f-date', type: 'date', required: true, value: profile?.date ?? '' });
  const time = el('input', { id: 'f-time', type: 'time', value: profile?.time ?? '' });
  const query = el('input', { id: 'f-place', type: 'search', placeholder: 'Ex. Neuchâtel', value: profile?.place ?? '' });
  const results = el('ul', { className: 'results', 'aria-live': 'polite' });
  const chosen = el('p', { className: 'muted small' });
  const error = el('p', { className: 'error', role: 'alert' });
  const lat = el('input', { id: 'f-lat', type: 'number', step: 'any', min: '-66', max: '66', value: profile?.latitude ?? '' });
  const lon = el('input', { id: 'f-lon', type: 'number', step: 'any', min: '-180', max: '180', value: profile?.longitude ?? '' });
  const tz = el('input', { id: 'f-tz', placeholder: 'Europe/Zurich', value: profile?.timeZone ?? 'Europe/Zurich' });

  const showChosen = () => {
    chosen.textContent = place ? `Lieu choisi : ${place.label} (${place.timeZone})` : 'Aucun lieu choisi.';
  };
  const choose = (result) => {
    place = result;
    lat.value = String(result.latitude);
    lon.value = String(result.longitude);
    tz.value = result.timeZone;
    query.value = result.label;
    results.replaceChildren();
    showChosen();
  };
  const search = async () => {
    results.replaceChildren(el('li', { text: 'Recherche…' }));
    try {
      const found = await searchPlace(query.value);
      results.replaceChildren(...(found.length
        ? found.map((r) => el('li', {}, [el('button', { type: 'button', className: 'link', text: r.label, onClick: () => choose(r) })]))
        : [el('li', { text: 'Aucun lieu trouvé.' })]));
    } catch {
      results.replaceChildren(el('li', { text: 'Recherche impossible. Entre les coordonnées à la main ci-dessous.' }));
    }
  };

  const field = (label, input, hint) => el('div', { className: 'field' }, [
    el('label', { for: input.id, text: label }), input, hint ? el('p', { className: 'muted small', text: hint }) : null,
  ]);

  const form = el('form', { method: 'dialog' }, [
    el('h2', { text: profile ? 'Modifier le profil' : 'Nouveau profil' }),
    field('Prénom ou surnom', name),
    field('Date de naissance', date),
    field('Heure de naissance', time, 'Laisse vide si tu ne la connais pas (pas d’ascendant dans ce cas).'),
    el('div', { className: 'field' }, [
      el('label', { for: 'f-place', text: 'Lieu de naissance' }),
      el('div', { className: 'row' }, [query, el('button', { type: 'button', className: 'secondary', text: 'Chercher', onClick: search })]),
      el('p', { className: 'muted small', text: 'La recherche interroge Open-Meteo : seul le nom du lieu est envoyé.' }),
      results, chosen,
    ]),
    el('details', {}, [
      el('summary', { text: 'Coordonnées manuelles' }),
      field('Latitude', lat), field('Longitude', lon), field('Fuseau horaire (IANA)', tz),
    ]),
    error,
    el('div', { className: 'row actions' }, [
      profile && onDelete ? el('button', { type: 'button', className: 'danger', text: 'Supprimer', onClick: () => { onDelete(profile); dialog.close(); } }) : null,
      el('button', { type: 'button', className: 'secondary', text: 'Annuler', onClick: () => dialog.close() }),
      el('button', { type: 'submit', text: 'Enregistrer' }),
    ]),
  ]);

  query.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search();
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const candidate = validateProfile({
      id: profile?.id,
      name: name.value,
      date: date.value,
      time: time.value || null,
      place: place?.label ?? query.value,
      latitude: Number.parseFloat(lat.value),
      longitude: Number.parseFloat(lon.value),
      timeZone: tz.value.trim(),
    });
    if (!candidate) {
      error.textContent = 'Vérifie le nom, la date et le lieu (latitude entre −66 et 66, fuseau valide).';
      return;
    }
    onSave(candidate);
    dialog.close();
  });

  showChosen();
  dialog.replaceChildren(form);
  dialog.showModal();
}
