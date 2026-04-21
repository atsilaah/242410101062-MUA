let inventaris = [];
let editIndex = null;

const $ = id => document.getElementById(id);

const rupiah = n => 'Rp ' + Number(n).toLocaleString('id-ID');

const toast = msg => {
    const t = $('inv-toast');
    t.textContent = msg;
    t.classList.add('on');
    setTimeout(() => t.classList.remove('on'), 2500);
};

const save = () => localStorage.setItem('mua_inv', JSON.stringify(inventaris));
const load = () => {
    const d = localStorage.getItem('mua_inv');
    inventaris = d ? JSON.parse(d) : [];
};

const renderStat = () => {
    $('stat-item').textContent = inventaris.length;
    $('stat-nilai').textContent = rupiah(
        inventaris.reduce((s, i) => s + i.stok * i.harga, 0)
    );
    $('stat-tipis').textContent = inventaris.filter(i => i.stok < 5).length;
};

const renderTabel = () => {
    const tbody = $('inv-tbody');
    const q = $('inv-search').value.toLowerCase();
    const kat = $('inv-kat').value;

    const data = inventaris.filter(i => {
        return (
            (i.nama.toLowerCase().includes(q) || i.kode.toLowerCase().includes(q)) &&
            (!kat || i.kat === kat)
        );
    });

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="7">Kosong</td></tr>`;
        renderStat();
        return;
    }

    tbody.innerHTML = data.map(i => {
        const idx = inventaris.indexOf(i);
        return `
        <tr>
            <td>${i.kode}</td>
            <td>${i.nama}</td>
            <td>${i.kat}</td>
            <td>${i.stok}</td>
            <td>${rupiah(i.harga)}</td>
            <td>${i.tgl}</td>
            <td>
                <button class="btn-edit-row" data-i="${idx}">Edit</button>
                <button class="btn-del-row" data-i="${idx}">Hapus</button>
            </td>
        </tr>`;
    }).join('');

    renderStat();
};

const filterCard = () => {
    const checked = [...document.querySelectorAll('aside input:checked')]
        .map(cb => cb.parentElement.textContent.trim());

    const cards = document.querySelectorAll('#Portofolio .card');

    cards.forEach(card => {
        const kat = card.dataset.kat;

        if (checked.length === 0 || checked.includes(kat)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
};

const bukaForm = (idx=null) => {
    editIndex = idx;

    if (idx !== null) {
        const d = inventaris[idx];
        $('f-kode').value = d.kode;
        $('f-nama').value = d.nama;
        $('f-kat').value = d.kat;
        $('f-stok').value = d.stok;
        $('f-harga').value = d.harga;
        $('f-tgl').value = d.tgl;
    } else {
        $('f-kode').value = '';
        $('f-nama').value = '';
        $('f-kat').value = '';
        $('f-stok').value = '';
        $('f-harga').value = '';
        $('f-tgl').value = '';
    }

    $('modal-form').classList.add('aktif');
};

const tutupForm = () => {
    $('modal-form').classList.remove('aktif');
    editIndex = null;
};

const simpan = () => {
    const data = {
        kode: $('f-kode').value,
        nama: $('f-nama').value,
        kat: $('f-kat').value,
        stok: +$('f-stok').value,
        harga: +$('f-harga').value,
        tgl: $('f-tgl').value
    };

    if (editIndex !== null) {
        inventaris[editIndex] = data;
        toast('Update berhasil');
    } else {
        inventaris.push(data);
        toast('Tambah berhasil');
    }

    save();
    tutupForm();
    renderTabel();
};

const hapus = idx => {
    if (!confirm('Hapus data?')) return;

    inventaris.splice(idx,1);
    save();
    renderTabel();
    toast('Dihapus');
};

document.addEventListener('DOMContentLoaded', () => {

    $('btn-tambah').onclick = () => bukaForm();

    $('fc-close').onclick = tutupForm;
    $('fc-batal').onclick = tutupForm;
    $('fc-simpan').onclick = simpan;

    $('inv-tbody').addEventListener('click', e => {
        const edit = e.target.closest('.btn-edit-row');
        const del = e.target.closest('.btn-del-row');

        if (edit) bukaForm(+edit.dataset.i);
        if (del) hapus(+del.dataset.i);
    });

    $('inv-search').addEventListener('input', () => {
        renderTabel();
    });

    $('inv-kat').addEventListener('change', renderTabel);

    document.querySelectorAll('aside input').forEach(cb => {
        cb.addEventListener('change', filterCard);
    });

    load();
    renderTabel();
});