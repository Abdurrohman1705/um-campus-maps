// ======================================================
// UM CAMPUS MAPS
// V3.3
// Lokasi Saya + Navigasi Real-Time
// Tracking GPS + Re-routing
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
// 6. VARIABEL NAVIGASI
// ======================================================

let routingControl = null;


// Lokasi pengguna saat ini
let currentUserLocation = null;


// Marker pengguna
let myLocationMarker = null;


// ID tracking GPS
let watchId = null;


// Tujuan navigasi
let navigationDestination = null;


// Nama tujuan
let navigationDestinationName = null;


// Posisi terakhir ketika routing dihitung
let lastRerouteLocation = null;


// Jarak minimum sebelum route dihitung ulang
const REROUTE_DISTANCE = 30;


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

                    🧭 Mulai Navigasi

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
// 13. UPDATE MARKER PENGGUNA
// ======================================================

function updateUserLocation(position) {

    const latitude =
        position.coords.latitude;


    const longitude =
        position.coords.longitude;


    // Simpan lokasi terbaru

    currentUserLocation = {

        lat: latitude,

        lng: longitude

    };


    // ==================================================
    // BUAT MARKER JIKA BELUM ADA
    // ==================================================

    if (!myLocationMarker) {

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

                    <span id="userLatitude">
                        ${latitude.toFixed(6)}
                    </span>

                </p>


                <p>

                    <strong>
                        Longitude:
                    </strong>

                    <br>

                    <span id="userLongitude">
                        ${longitude.toFixed(6)}
                    </span>

                </p>

            </div>

        `);

    }


    // ==================================================
    // PINDAHKAN MARKER
    // ==================================================

    else {

        myLocationMarker.setLatLng([

            latitude,

            longitude

        ]);

    }


    // ==================================================
    // UPDATE INFORMASI POPUP
    // ==================================================

    const latElement =
        document.getElementById("userLatitude");


    const lngElement =
        document.getElementById("userLongitude");


    if (latElement) {

        latElement.innerText =
            latitude.toFixed(6);

    }


    if (lngElement) {

        lngElement.innerText =
            longitude.toFixed(6);

    }


    // ==================================================
    // JIKA SEDANG NAVIGASI
    // ==================================================

    if (

        navigationDestination &&

        lastRerouteLocation

    ) {

        const distanceMoved =

            map.distance(

                [
                    lastRerouteLocation.lat,
                    lastRerouteLocation.lng
                ],

                [
                    latitude,
                    longitude
                ]

            );


        // ==================================================
        // HITUNG ULANG RUTE JIKA BERGERAK CUKUP JAUH
        // ==================================================

        if (

            distanceMoved >=

            REROUTE_DISTANCE

        ) {

            lastRerouteLocation = {

                lat: latitude,

                lng: longitude

            };


            hitungUlangRute();

        }

    }

}


// ======================================================
// 14. ERROR GPS
// ======================================================

function handleLocationError(error) {

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

}


// ======================================================
// 15. MULAI TRACKING GPS
// ======================================================

function mulaiTrackingLokasi() {

    if (!navigator.geolocation) {

        alert(
            "Browser kamu tidak mendukung fitur lokasi."
        );

        return;

    }


    // Jangan membuat tracking ganda

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

    }


    myLocationButton.innerHTML =
        "⏳ Melacak lokasi...";


    watchId =

        navigator.geolocation.watchPosition(

            function(position) {

                updateUserLocation(
                    position
                );


                myLocationButton.innerHTML =
                    "📍 Lokasi Saya";

            },


            function(error) {

                handleLocationError(
                    error
                );

            },


            {

                enableHighAccuracy: true,

                timeout: 10000,

                maximumAge: 0

            }

        );

}


// ======================================================
// 16. TOMBOL LOKASI SAYA
// ======================================================

myLocationButton.addEventListener(

    "click",

    function() {

        mulaiTrackingLokasi();


        // Jika posisi sudah tersedia
        // fokuskan peta ke posisi tersebut

        if (currentUserLocation) {

            map.setView(

                [

                    currentUserLocation.lat,

                    currentUserLocation.lng

                ],

                18

            );

        }

    }

);


// ======================================================
// 17. HITUNG ULANG RUTE
// ======================================================

function hitungUlangRute() {

    if (

        !currentUserLocation ||

        !navigationDestination

    ) {

        return;

    }


    // Hapus route lama

    if (routingControl) {

        map.removeControl(

            routingControl

        );

        routingControl = null;

    }


    // ==================================================
    // ROUTING BARU
    // ==================================================

    routingControl =

        L.Routing.control({

            waypoints: [

                L.latLng(

                    currentUserLocation.lat,

                    currentUserLocation.lng

                ),


                L.latLng(

                    navigationDestination.lat,

                    navigationDestination.lng

                )

            ],


            router:

                L.Routing.osrmv1({

                    serviceUrl:

                        "https://router.project-osrm.org/route/v1"

                }),


            addWaypoints: false,


            createMarker: function() {

                return null;

            },


            routeWhileDragging: false,


            fitSelectedRoutes: false,


            language: "en",


            lineOptions: {

                styles: [

                    {

                        color: "#1976d2",

                        opacity: 0.9,

                        weight: 6

                    }

                ]

            },


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


            let jarakText;


            if (distance < 1000) {

                jarakText =

                    Math.round(distance) +

                    " meter";

            }

            else {

                jarakText =

                    (

                        distance / 1000

                    ).toFixed(2) +

                    " km";

            }


            const menit =

                Math.round(

                    time / 60

                );


            // ==================================================
            // HANYA TAMPILKAN INFORMASI PADA AWAL NAVIGASI
            // ==================================================

            if (!lastRerouteLocation) {

                alert(

                    "Navigasi dimulai!\n\n" +

                    "Tujuan: " +

                    navigationDestinationName +

                    "\n" +

                    "Jarak: " +

                    jarakText +

                    "\n" +

                    "Estimasi: ±" +

                    menit +

                    " menit"

                );

            }

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
// 18. MULAI NAVIGASI
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
    // SIMPAN TUJUAN
    // ==================================================

    navigationDestination = {

        lat: tujuanLat,

        lng: tujuanLng

    };


    navigationDestinationName =
        namaTujuan;


    // ==================================================
    // SIMPAN POSISI AWAL
    // ==================================================

    lastRerouteLocation = {

        lat: currentUserLocation.lat,

        lng: currentUserLocation.lng

    };


    // ==================================================
    // HITUNG RUTE
    // ==================================================

    hitungUlangRute();

}


// ======================================================
// 19. SELESAI V3.3
// ======================================================