// ── Scroll Reveal ──
(function(){
  const reveals = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
      }
    });
  }, {threshold: 0.1, rootMargin: '0px 0px -50px 0px'});
  reveals.forEach(function(el){ observer.observe(el); });
})();

// ── Parallax ──
(function(){
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  window.addEventListener('scroll', function(){
    const scrollY = window.scrollY;
    parallaxEls.forEach(function(el){
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) * speed;
      el.style.transform = 'translateY(' + offset + 'px)';
    });
  });
})();

// ── Nav scroll effect ──
(function(){
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', function(){
    if(window.scrollY > 80){
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
})();

// ── Mobile menu ──
(function(){
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if(!toggle || !menu) return;
  toggle.addEventListener('click', function(){
    menu.classList.toggle('active');
    toggle.classList.toggle('active');
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      menu.classList.remove('active');
      toggle.classList.remove('active');
    });
  });
})();

// ── Smooth scroll for anchor links ──
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
})();

// ── Gallery Lightbox ──
(function(){
  var galleryItems = document.querySelectorAll('.gallery-item');
  if(!galleryItems.length) return;

  // Create lightbox DOM
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<div class="lightbox-backdrop"></div>' +
    '<div class="lightbox-content">' +
    '<button class="lightbox-close" aria-label="Close"><i class="fas fa-xmark"></i></button>' +
    '<button class="lightbox-nav lightbox-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>' +
    '<button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>' +
    '<img src="" alt="" />' +
    '<div class="lightbox-caption"><h4></h4><p></p></div>' +
    '</div>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector('img');
  var lbTitle = lb.querySelector('.lightbox-caption h4');
  var lbDesc = lb.querySelector('.lightbox-caption p');
  var currentIndex = 0;
  var items = [];

  // Add zoom icon to each gallery item
  galleryItems.forEach(function(item, i){
    var icon = document.createElement('div');
    icon.className = 'zoom-icon';
    icon.innerHTML = '<i class="fas fa-expand"></i>';
    item.appendChild(icon);

    items.push({
      fullSrc: item.querySelector('img').getAttribute('data-src') || item.querySelector('img').src,
      title: item.querySelector('h4') ? item.querySelector('h4').textContent : '',
      desc: item.querySelector('p') ? item.querySelector('p').textContent : ''
    });

    item.addEventListener('click', function(){
      currentIndex = i;
      showLightbox();
    });
  });

  function showLightbox(){
    var data = items[currentIndex];
    lbImg.src = data.fullSrc;
    lbImg.alt = data.title;
    lbTitle.textContent = data.title;
    lbDesc.textContent = data.desc;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideLightbox(){
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function nextImage(){
    currentIndex = (currentIndex + 1) % items.length;
    showLightbox();
  }

  function prevImage(){
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    showLightbox();
  }

  lb.querySelector('.lightbox-backdrop').addEventListener('click', hideLightbox);
  lb.querySelector('.lightbox-close').addEventListener('click', hideLightbox);
  lb.querySelector('.lightbox-next').addEventListener('click', nextImage);
  lb.querySelector('.lightbox-prev').addEventListener('click', prevImage);

  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('active')) return;
    if(e.key === 'Escape') hideLightbox();
    if(e.key === 'ArrowRight') nextImage();
    if(e.key === 'ArrowLeft') prevImage();
  });

  // Touch swipe
  var touchStartX = 0;
  lb.addEventListener('touchstart', function(e){ touchStartX = e.changedTouches[0].screenX; });
  lb.addEventListener('touchend', function(e){
    var diff = touchStartX - e.changedTouches[0].screenX;
    if(Math.abs(diff) > 50){
      if(diff > 0) nextImage(); else prevImage();
    }
  });
})();

// ── Lazy load images ──
(function(){
  const imgs = document.querySelectorAll('img[data-src]');
  const imgObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        imgObserver.unobserve(img);
      }
    });
  }, {rootMargin:'200px'});
  imgs.forEach(function(img){ imgObserver.observe(img); });
})();

// ── Hero constellation ──
(function(){
  var canvas = document.getElementById('hero-lines');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var mouse = {x: -9999, y: -9999};
  var particles = [];
  var dpr = window.devicePixelRatio || 1;
  var hero = document.getElementById('hero');
  var PARTICLE_COUNT = 80;
  var MAX_DIST = 150;
  var MOUSE_DIST = 200;

  function resize(){
    var rect = hero.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function init(){
    var rect = hero.getBoundingClientRect();
    particles = [];
    for(var i = 0; i < PARTICLE_COUNT; i++){
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: 1.2 + Math.random() * 1.5
      });
    }
  }

  hero.addEventListener('mousemove', function(e){
    var rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', function(){
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function dist(a, b){ return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)); }

  function draw(){
    var rect = hero.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    ctx.clearRect(0, 0, w, h);

    for(var i = 0; i < particles.length; i++){
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < 0) p.x = w;
      if(p.x > w) p.x = 0;
      if(p.y < 0) p.y = h;
      if(p.y > h) p.y = 0;
    }

    for(var i = 0; i < particles.length; i++){
      for(var j = i + 1; j < particles.length; j++){
        var d = dist(particles[i], particles[j]);
        if(d < MAX_DIST){
          var alpha = (1 - d / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(0,212,170,' + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    for(var i = 0; i < particles.length; i++){
      var p = particles[i];
      var md = dist(p, mouse);

      if(md < MOUSE_DIST){
        var alpha = (1 - md / MOUSE_DIST);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = 'rgba(123,97,255,' + (alpha * 0.5) + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + alpha * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,170,' + (0.25 + alpha * 0.75) + ')';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + alpha * 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,170,' + (alpha * 0.15) + ')';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,170,0.18)';
        ctx.fill();
      }
    }

    var md = dist({x: mouse.x, y: mouse.y}, {x: 0, y: 0});
    if(mouse.x > 0){
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(123,97,255,0.7)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(123,97,255,0.1)';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', function(){ resize(); init(); });
})();
