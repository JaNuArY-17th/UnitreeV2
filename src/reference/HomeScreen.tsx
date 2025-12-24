<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>WiFi Tracker Home</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f9f506",
                        "accent-green": "#98D56D",
                        "accent-blue": "#B7DDE6",
                        "background-light": "#f8f8f5",
                        "background-dark": "#23220f",
                    },
                    fontFamily: {
                        "display": ["Spline Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "1rem", 
                        "lg": "1.5rem", 
                        "xl": "2rem", 
                        "2xl": "3rem",
                        "3xl": "4rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        "soft": "0 10px 40px -10px rgba(0,0,0,0.08)",
                        "glow": "0 0 20px rgba(249, 245, 6, 0.4)",
                        "nav": "0 10px 40px -10px rgba(0,0,0,0.15)"
                    }
                },
            },
        }
    </script>
<style>.no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-[#1c1c0d] dark:text-white overflow-x-hidden">
<div class="relative flex h-full min-h-screen w-full flex-col pb-32">
<header class="flex items-center justify-between p-6">
<div class="flex items-center gap-4">
<div class="relative group cursor-pointer">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 ring-2 ring-white dark:ring-background-dark shadow-md" data-alt="User profile picture of a young man smiling" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCbsAH1GznMMjxr7PfEKiQsT3aCR2Wvni7gGRHs2t2Hm0_2azY8ImT2vyfrtQiYOY-sX58e6nKvHAvVL3LvDa5YVgNqGmy9-SoBeo3v2MB16AJJ7Juw_D7Hx0ufhdwI8vI2Y36jFUbW3ucgMHsfaCKtTojidB5N35_rSTxGLiZLnYTBSiRsokn3XJMekqJZS6HfuOHh7t1uDhUbbpzLXISeEyTOKEwXkRLtvzF9VJrbb9ztBgcOBgJbjrSuV4IRkMSCbkv4JaOLGg");'>
</div>
<div class="absolute bottom-0 right-0 size-3 bg-accent-green border-2 border-white dark:border-background-dark rounded-full"></div>
</div>
<div>
<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Good Morning,</p>
<h2 class="text-xl font-bold leading-tight text-[#1c1c0d] dark:text-white">Alex</h2>
</div>
</div>
<button class="relative flex size-12 items-center justify-center rounded-full bg-white dark:bg-[#32321a] shadow-sm hover:shadow-md transition-shadow">
<span class="material-symbols-outlined text-[#1c1c0d] dark:text-white">notifications</span>
<span class="absolute top-3 right-3 flex h-2.5 w-2.5">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
</span>
</button>
</header>
<section class="flex flex-col items-center justify-center py-6 px-4">
<div class="relative flex items-center justify-center">
<div class="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-90 dark:bg-primary/10"></div>
<div class="relative flex size-72 items-center justify-center rounded-full bg-white dark:bg-[#2a2912] shadow-soft border border-gray-100 dark:border-gray-800">
<svg class="absolute inset-0 h-full w-full -rotate-90 transform p-4" viewBox="0 0 100 100">
<circle class="dark:stroke-gray-700" cx="50" cy="50" fill="transparent" r="44" stroke="#f1f1f1" stroke-width="6"></circle>
<circle cx="50" cy="50" fill="transparent" r="44" stroke="#f9f506" stroke-dasharray="276" stroke-dashoffset="69" stroke-linecap="round" stroke-width="6"></circle>
</svg>
<div class="flex flex-col items-center gap-1 z-10 text-center">
<span class="text-sm font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">Current Session</span>
<h1 class="text-5xl font-bold tabular-nums tracking-tight text-[#1c1c0d] dark:text-white mt-2">02:45</h1>
<p class="text-lg font-medium text-gray-500 dark:text-gray-300">12s</p>
<div class="mt-4 flex items-center gap-1 rounded-full bg-primary/20 px-4 py-1.5 text-yellow-700 dark:text-yellow-200">
<span class="material-symbols-outlined text-lg">bolt</span>
<span class="font-bold">+15 pts</span>
</div>
</div>
</div>
<div class="absolute -right-2 top-10 flex size-10 items-center justify-center rounded-full bg-accent-green shadow-lg animate-bounce" style="animation-duration: 3s;">
<span class="material-symbols-outlined text-white text-xl">wifi</span>
</div>
</div>
</section>
<section class="px-6 py-2">
<div class="flex items-center justify-between gap-4 rounded-2xl bg-[#fcfcf8] dark:bg-[#32321a] p-3 pr-8 shadow-sm border border-gray-100 dark:border-transparent">
<div class="flex items-center gap-4">
<div class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-accent-blue/20">
<span class="material-symbols-outlined text-accent-blue text-3xl">router</span>
</div>
<div class="flex flex-col">
<p class="text-lg font-bold leading-tight text-[#1c1c0d] dark:text-white">Starbucks_5G</p>
<div class="flex items-center gap-2 mt-1">
<span class="flex size-2 rounded-full bg-accent-green"></span>
<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Excellent Signal</p>
</div>
</div>
</div>
<div class="text-right">
<p class="text-lg font-bold text-[#1c1c0d] dark:text-white">120</p>
<p class="text-xs font-medium text-gray-400 uppercase">Mbps</p>
</div>
</div>
</section>
<section class="mt-6 w-full overflow-hidden">
<div class="flex gap-3 px-6 pb-2 overflow-x-auto no-scrollbar">
<button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary px-6 shadow-glow transition-transform active:scale-95">
<span class="material-symbols-outlined text-[#1c1c0d]">redeem</span>
<span class="text-[#1c1c0d] text-sm font-bold">Redeem Points</span>
</button>
<button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-[#32321a] border border-gray-100 dark:border-gray-700 px-6 shadow-sm transition-transform active:scale-95">
<span class="material-symbols-outlined text-[#1c1c0d] dark:text-white">history</span>
<span class="text-[#1c1c0d] dark:text-white text-sm font-medium">History</span>
</button>
<button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-[#32321a] border border-gray-100 dark:border-gray-700 px-6 shadow-sm transition-transform active:scale-95">
<span class="material-symbols-outlined text-[#1c1c0d] dark:text-white">map</span>
<span class="text-[#1c1c0d] dark:text-white text-sm font-medium">Map</span>
</button>
</div>
</section>
<section class="mt-6 flex flex-col gap-4">
<div class="px-6 flex items-center justify-between">
<h3 class="text-lg font-bold text-[#1c1c0d] dark:text-white">Discover</h3>
<a class="text-sm font-medium text-gray-400" href="#">View All</a>
</div>
<div class="flex gap-4 overflow-x-auto px-6 pb-6 no-scrollbar snap-x snap-mandatory">
<div class="snap-center shrink-0 w-72 rounded-2xl bg-accent-green/20 p-6 relative overflow-hidden group">
<div class="absolute -right-6 -top-6 size-24 rounded-full bg-accent-green/30 blur-xl"></div>
<div class="relative z-10 flex flex-col h-full justify-between gap-8">
<div>
<span class="inline-block rounded-full bg-white/60 dark:bg-black/20 px-3 py-1 text-xs font-bold text-green-800 dark:text-green-100 mb-3">PROMO</span>
<h4 class="text-xl font-bold text-[#1c1c0d] dark:text-white leading-tight">Double points weekend starts now!</h4>
</div>
<div class="flex items-center justify-between">
<p class="text-sm font-medium text-gray-600 dark:text-gray-200">Ends Sunday</p>
<button class="size-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center text-[#1c1c0d] dark:text-white">
<span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>
<div class="snap-center shrink-0 w-72 rounded-2xl bg-accent-blue/20 p-6 relative overflow-hidden group">
<div class="absolute -right-6 -bottom-6 size-32 rounded-full bg-accent-blue/30 blur-xl"></div>
<div class="relative z-10 flex flex-col h-full justify-between gap-8">
<div>
<span class="inline-block rounded-full bg-white/60 dark:bg-black/20 px-3 py-1 text-xs font-bold text-blue-800 dark:text-blue-100 mb-3">NEWS</span>
<h4 class="text-xl font-bold text-[#1c1c0d] dark:text-white leading-tight">New WiFi zones added in Downtown.</h4>
</div>
<div class="flex items-center justify-between">
<p class="text-sm font-medium text-gray-600 dark:text-gray-200">See Map</p>
<button class="size-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center text-[#1c1c0d] dark:text-white">
<span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
</section>
</div>
<div class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 w-[90%] max-w-[360px]">
<nav class="flex h-[72px] items-center justify-between rounded-[2.5rem] bg-white/95 backdrop-blur-md dark:bg-[#1c1c0d]/95 px-3 shadow-nav ring-1 ring-black/5 dark:ring-white/10">
<a class="flex h-14 w-14 items-center justify-center rounded-full bg-accent-green text-[#1c1c0d] shadow-lg shadow-accent-green/20 transition-all duration-300 transform hover:scale-105" href="#">
<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M9.02 2.84016L3.63 7.04016C2.73 7.74016 2 9.23016 2 10.3602V17.7702C2 20.0902 3.89 21.9902 6.21 21.9902H17.79C20.11 21.9902 22 20.0902 22 17.7702V10.5002C22 9.29016 21.19 7.74016 20.2 7.05016L14.02 2.72016C12.62 1.74016 10.37 1.79016 9.02 2.84016Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
<path d="M12 18V15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</a>
<a class="flex h-14 w-14 items-center justify-center rounded-full text-gray-400 hover:text-[#1c1c0d] dark:text-gray-500 dark:hover:text-white transition-colors" href="#">
<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M19 20H5C3.89543 20 3 19.1046 3 18V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20Z" stroke="currentColor" stroke-dasharray="14 6" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
<path d="M16.5 14H18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
<path d="M18 7V5.60001C18 4.25001 16.92 3.03001 15.57 2.68001C12.98 2.01001 10.31 2.37001 7 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</a>
<a class="flex h-14 w-14 items-center justify-center rounded-full text-gray-400 hover:text-[#1c1c0d] dark:text-gray-500 dark:hover:text-white transition-colors" href="#">
<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="11" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></circle>
<path d="M12 22C12 22 20 16 20 11C20 6.58172 16.4183 3 12 3C7.58172 3 4 6.58172 4 11C4 16 12 22 12 22Z" stroke="currentColor" stroke-dasharray="14 8" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</a>
<a class="flex h-14 w-14 items-center justify-center rounded-full text-gray-400 hover:text-[#1c1c0d] dark:text-gray-500 dark:hover:text-white transition-colors" href="#">
<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></circle>
<path d="M20.2 14.5L21.4 15.8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
<path d="M22 12C22 13.7 21.6 15.2 20.8 16.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
<path d="M12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C16.1 2 19.6 4.5 21.2 8.1" stroke="currentColor" stroke-dasharray="8 6" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</a>
</nav>
</div>

</body></html>