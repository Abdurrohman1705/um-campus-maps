// ======================================================
// UM CAMPUS MAPS
// V3.2
// Lokasi Saya + Navigasi Menuju Marker
// ======================================================


// ======================================================
// 1. POSISI AWAL PETA
// ======================================================

const umLocation = [-7.9617, 112.6177];


// ======================================================
// 2. MEMBUAT PETA
// ======================================================

const map = L.map("map").setView(
    umLocation,
    16
);


// ======================================================
// 3. OPENSTREETMAP
// ======================================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ======================================================
// 4. DATA LOKASI
// ======================================================

const locations = [

    {
        nama: "Fakultas Ilmu Sosial UM",

        kategori: "Gedung",

        lat: -7.9641526,

        lng: 112.6177915,

        deskripsi:
            "Fakultas Ilmu Sosial Universitas Negeri Malang, Kampus I UM."
    },


    {
        nama: "Fakultas Ilmu Pendidikan UM",

        kategori: "Gedung",

        lat: -7.9625204,

        lng: 112.6151851,

        deskripsi:
            "Fakultas Ilmu Pendidikan Universitas Negeri Malang, Kampus I UM."
    },


    {
        nama: "Masjid Al-Hikmah UM",

        kategori: "Fasilitas",

        lat: -7.961398407299380,

        lng: 112.61702580905700,

        deskripsi:
            "Masjid Al-Hikmah Universitas Negeri Malang yang berada di kompleks Kampus I UM."
    },


    {
        nama: "Graha Cakrawala UM",

        kategori: "Fasilitas",

        lat: -7.959254723351540,

        lng: 112.61833401090200,

        deskripsi:
            "Graha Cakrawala merupakan gedung pertemuan serbaguna Universitas Negeri Malang."
    },


    {
        nama: "Perpustakaan UM",

        kategori: "Fasilitas",

        lat: -7.962081463376340,

        lng: 112.61655927837600,

        deskripsi:
            "Perpustakaan Universitas Negeri Malang yang mendukung kegiatan pembelajaran dan penelitian mahasiswa."
    }

];


// ======================================================
// 5. VARIABEL MARKER
// ======================================================

let markers = [];


// ======================================================
// 6. VARIABEL ROUTING
// ======================================================

let routingControl = null;


// Lokasi pengguna
let currentUserLocation = null;


// Marker lokasi pengguna
let myLocationMarker = null;


// ======================================================
// 7. MENAMPILKAN MARKER
// ======================================================

function tampilkanLokasi(data) {


    // Hapus marker lama

    markers.forEach(function(marker) {

        map.removeLayer(marker);

    });


    markers = [];


    // Membuat marker baru

    data.forEach(function(lokasi) {


        const marker = L.marker([

            lokasi.lat,

            lokasi.lng

        ]).addTo(map);


        // ==================================================
        // POPUP
        // ==================================================

        marker.bindPopup(`

            <div style="min-width:250px">

                <h3 style="
                    margin-top:0;
                    margin-bottom:8px;
                ">

                    ${lokasi.nama}

                </h3>


                <p>

                    <strong>Kategori:</strong>

                    ${lokasi.kategori}

                </p>


                <p>

                    ${lokasi.deskripsi}

                </p>


                <hr>


                <p style="font-size:12px;">

                    📍 Latitude:
                    ${lokasi.lat}

                    <br>

                    📍 Longitude:
                    ${lokasi.lng}

                </p>


                <button

                    onclick="
                        mulaiNavigasi(
                            ${lokasi.lat},
                            ${lokasi.lng},
                            '${lokasi.nama.replace(/'/g, "\\'")}'
                        )
                    "

                    style="
                        width:100%;
                        padding:10px;
                        border:none;
                        border-radius:6px;
                        background:#1976d2;
                        color:white;
                        cursor:pointer;
                        font-size:14px;
                    "

                >

                    🧭 Navigasi ke sini

                </button>


            </div>

        `);


        markers.push(marker);

    });

}


// ======================================================
// 8. TAMPILKAN SEMUA LOKASI
// ======================================================

tampilkanLokasi(locations);


// ======================================================
// 9. FILTER KATEGORI
// ======================================================

function filterCategory(kategori) {


    if (kategori === "Semua") {

        tampilkanLokasi(locations);

        return;

    }


    const hasil = locations.filter(

        function(lokasi) {

            return lokasi.kategori === kategori;

        }

    );


    tampilkanLokasi(hasil);


    if (hasil.length === 0) {

        alert(
            "Belum ada lokasi untuk kategori " +
            kategori
        );

    }

}


// ======================================================
// 10. SEARCH
// ======================================================

const searchButton =
    document.getElementById("searchButton");


const searchInput =
    document.getElementById("searchInput");


searchButton.addEventListener(

    "click",

    function() {


        const keyword =

            searchInput.value
                .toLowerCase()
                .trim();


        if (keyword === "") {

            tampilkanLokasi(locations);

            return;

        }


        const hasil =

            locations.filter(

                function(lokasi) {


                    return (

                        lokasi.nama
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        lokasi.kategori
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        lokasi.deskripsi
                            .toLowerCase()
                            .includes(keyword)

                    );

                }

            );


        tampilkanLokasi(hasil);


        if (hasil.length === 0) {

            alert(
                'Lokasi "' +
                searchInput.value +
                '" tidak ditemukan.'
            );

        }

    }

);


// ======================================================
// 11. ENTER UNTUK SEARCH
// ======================================================

searchInput.addEventListener(

    "keypress",

    function(event) {


        if (event.key === "Enter") {

            searchButton.click();

        }

    }

);


// ======================================================
// 12. TOMBOL LOKASI SAYA
// ======================================================

const myLocationButton =

    document.getElementById(
        "myLocationButton"
    );


// ======================================================
// 13. LOKASI SAYA
// ======================================================

myLocationButton.addEventListener(

    "click",

    function() {


        if (!navigator.geolocation) {

            alert(
                "Browser kamu tidak mendukung fitur lokasi."
            );

            return;

        }


        myLocationButton.innerHTML =
            "⏳ Mencari lokasi...";


        navigator.geolocation.getCurrentPosition(


            // ==============================================
            // BERHASIL
            // ==============================================

            function(position) {


                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                // Simpan lokasi

                currentUserLocation = {

                    lat: latitude,

                    lng: longitude

                };


                // Hapus marker lama

                if (myLocationMarker) {

                    map.removeLayer(
                        myLocationMarker
                    );

                }


                // Buat marker pengguna

                myLocationMarker =

                    L.marker([

                        latitude,

                        longitude

                    ]).addTo(map);


                myLocationMarker.bindPopup(`

                    <div>

                        <h3>
                            📍 Lokasi Saya
                        </h3>

                        <p>

                            <strong>
                                Latitude:
                            </strong>

                            <br>

                            ${latitude.toFixed(6)}

                        </p>


                        <p>

                            <strong>
                                Longitude:
                            </strong>

                            <br>

                            ${longitude.toFixed(6)}

                        </p>

                    </div>

                `);


                myLocationMarker.openPopup();


                // Fokus ke lokasi

                map.setView(

                    [
                        latitude,

                        longitude
                    ],

                    18

                );


                myLocationButton.innerHTML =
                    "📍 Lokasi Saya";

            },


            // ==============================================
            // ERROR
            // ==============================================

            function(error) {


                myLocationButton.innerHTML =
                    "📍 Lokasi Saya";


                switch (error.code) {


                    case error.PERMISSION_DENIED:

                        alert(
                            "Akses lokasi ditolak. " +
                            "Izinkan akses lokasi pada browser."
                        );

                        break;


                    case error.POSITION_UNAVAILABLE:

                        alert(
                            "Lokasi tidak tersedia."
                        );

                        break;


                    case error.TIMEOUT:

                        alert(
                            "Waktu pencarian lokasi habis."
                        );

                        break;


                    default:

                        alert(
                            "Terjadi kesalahan saat mengambil lokasi."
                        );

                }

            },


            {

                enableHighAccuracy: true,

                timeout: 10000,

                maximumAge: 0

            }

        );

    }

);


// ======================================================
// 14. V3.2 - MULAI NAVIGASI
// ======================================================

function mulaiNavigasi(

    tujuanLat,

    tujuanLng,

    namaTujuan

) {


    // ==================================================
    // CEK LOKASI PENGGUNA
    // ==================================================

    if (!currentUserLocation) {


        alert(

            "Lokasi kamu belum diketahui.\n\n" +

            "Klik 📍 Lokasi Saya terlebih dahulu."

        );


        return;

    }


    // ==================================================
    // HAPUS RUTE SEBELUMNYA
    // ==================================================

    if (routingControl) {


        map.removeControl(

            routingControl

        );


        routingControl = null;

    }


    // ==================================================
    // BUAT RUTE
    // ==================================================

    routingControl =

        L.Routing.control({

            waypoints: [

                L.latLng(

                    currentUserLocation.lat,

                    currentUserLocation.lng

                ),


                L.latLng(

                    tujuanLat,

                    tujuanLng

                )

            ],


            // OSRM ROUTER

            router:

                L.Routing.osrmv1({

                    serviceUrl:

                        "https://router.project-osrm.org/route/v1"

                }),


            // Tidak bisa menambah waypoint

            addWaypoints: false,


            // Tidak membuat marker tambahan

            createMarker: function() {

                return null;

            },


            // Tidak menghitung ulang saat drag

            routeWhileDragging: false,


            // Fokus ke rute

            fitSelectedRoutes: true,


            // Bahasa

            language: "en",


            // Tampilan garis

            lineOptions: {

                styles: [

                    {

                        color: "#1976d2",

                        opacity: 0.9,

                        weight: 6

                    }

                ]

            },


            // Tampilkan panel

            show: true

        })

        .addTo(map);


    // ==================================================
    // ROUTE BERHASIL
    // ==================================================

    routingControl.on(

        "routesfound",

        function(event) {


            const route =

                event.routes[0];


            const distance =

                route.summary.totalDistance;


            const time =

                route.summary.totalTime;


            // Jarak

            let jarakText;


            if (distance < 1000) {


                jarakText =

                    Math.round(distance) +

                    " meter";


            } else {


                jarakText =

                    (

                        distance / 1000

                    ).toFixed(2) +

                    " km";

            }


            // Waktu

            const menit =

                Math.round(

                    time / 60

                );


            alert(

                "Rute ditemukan!\n\n" +

                "Tujuan: " +

                namaTujuan +

                "\n" +

                "Jarak: " +

                jarakText +

                "\n" +

                "Estimasi: ±" +

                menit +

                " menit"

            );

        }

    );


    // ==================================================
    // ERROR ROUTING
    // ==================================================

    routingControl.on(

        "routingerror",

        function() {


            alert(

                "Rute tidak dapat ditemukan.\n\n" +

                "Pastikan koneksi internet aktif."

            );

        }

    );

}


// ======================================================
// V3.2 SELESAI
// ======================================================