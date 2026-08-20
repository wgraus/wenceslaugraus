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

// ── Parallax (throttled) ──
(function(){
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  let ticking = false;
  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(function(){
        const scrollY = window.scrollY;
        parallaxEls.forEach(function(el){
          const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const offset = (center - window.innerHeight / 2) * speed;
          el.style.transform = 'translateY(' + offset + 'px)';
        });
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ── Nav scroll effect (throttled) ──
(function(){
  const nav = document.getElementById('nav');
  let navTicking = false;
  window.addEventListener('scroll', function(){
    if(!navTicking){
      requestAnimationFrame(function(){
        if(window.scrollY > 80){
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        navTicking = false;
      });
      navTicking = true;
    }
  });
})();

// ── Mobile menu ──
(function(){
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if(!toggle || !menu) return;
  toggle.addEventListener('click', function(){
    const isActive = menu.classList.toggle('active');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    menu.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      menu.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
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

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image viewer');
  lb.innerHTML = '<div class="lightbox-backdrop"></div>' +
    '<div class="lightbox-content">' +
    '<button class="lightbox-close" aria-label="Close"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
    '<button class="lightbox-nav lightbox-prev" aria-label="Previous"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>' +
    '<button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>' +
    '<img src="" alt="" />' +
    '<div class="lightbox-caption"><h3></h3><p></p></div>' +
    '</div>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector('img');
  var lbTitle = lb.querySelector('.lightbox-caption h3');
  var lbDesc = lb.querySelector('.lightbox-caption p');
  var currentIndex = 0;
  var items = [];
  var lastFocused = null;

  galleryItems.forEach(function(item, i){
    var icon = document.createElement('div');
    icon.className = 'zoom-icon';
    icon.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
    item.appendChild(icon);

    items.push({
      fullSrc: item.querySelector('img').getAttribute('data-src') || item.querySelector('img').src,
      title: item.querySelector('h3') ? item.querySelector('h3').textContent : '',
      desc: item.querySelector('p') ? item.querySelector('p').textContent : ''
    });

    item.addEventListener('click', function(){
      currentIndex = i;
      showLightbox();
    });

    item.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        currentIndex = i;
        showLightbox();
      }
    });
  });

  function showLightbox(){
    lastFocused = document.activeElement;
    var data = items[currentIndex];
    lbImg.src = data.fullSrc;
    lbImg.alt = data.title;
    lbTitle.textContent = data.title;
    lbDesc.textContent = data.desc;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lightbox-close').focus();
  }

  function hideLightbox(){
    lb.classList.remove('active');
    document.body.style.overflow = '';
    if(lastFocused) lastFocused.focus();
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

  // Focus trap
  lb.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      hideLightbox();
      return;
    }
    if(e.key === 'ArrowRight'){
      nextImage();
      return;
    }
    if(e.key === 'ArrowLeft'){
      prevImage();
      return;
    }
    if(e.key === 'Tab'){
      var focusable = lb.querySelectorAll('button');
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if(e.shiftKey){
        if(document.activeElement === first){
          e.preventDefault();
          last.focus();
        }
      } else {
        if(document.activeElement === last){
          e.preventDefault();
          first.focus();
        }
      }
    }
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

// ── Track draw animation ──
(function(){
  var trackPairs = [
    {bg: '.track-1-bg', line: '.track-1-line', dots: '.track-1-dot, .track-1-dot-end'},
    {bg: '.track-2-bg', line: '.track-2-line', dots: '.track-2-dot, .track-2-dot-end'}
  ];
  var tracksGrid = document.querySelector('.tracks-grid');
  if(!tracksGrid) return;

  trackPairs.forEach(function(pair){
    var line = document.querySelector(pair.line);
    var bg = document.querySelector(pair.bg);
    if(!line) return;

    var length = line.getTotalLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;

    if(bg){
      var bgLength = bg.getTotalLength();
      bg.style.strokeDasharray = bgLength;
      bg.style.strokeDashoffset = bgLength;
    }
  });

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        trackPairs.forEach(function(pair){
          var line = document.querySelector(pair.line);
          var bg = document.querySelector(pair.bg);
          if(line) line.style.strokeDashoffset = '0';
          if(bg) bg.style.strokeDashoffset = '0';
          document.querySelectorAll(pair.dots).forEach(function(d){ d.classList.add('animated'); });
        });
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.2});
  observer.observe(tracksGrid);
})();

// ── Hero constellation ──
(function(){
  var canvas = document.getElementById('hero-lines');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  if(!ctx) return;
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
    if(document.hidden){
      requestAnimationFrame(draw);
      return;
    }

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

// ── Terminal typing animation ──
(function(){
  var body = document.getElementById('terminal-body');
  if(!body) return;

  var sequences = [
    {type:'cmd', text:'boot --dev-env', delay:0},
    {type:'line', cls:'dim', text:'[init] Loading workspace...', delay:600},
    {type:'line', cls:'dim', text:'[init] Configuring neural pipelines...', delay:500},
    {type:'blank', delay:400},
    {type:'line', cls:'accent bold', text:'$ Loading GPT-4o model...', delay:300},
    {type:'thinking', cls:'info', text:'Thinking', duration:2200},
    {type:'line', cls:'success', text:'  GPT-4o loaded. 1.8T params ready.', delay:200},
    {type:'blank', delay:300},
    {type:'line', cls:'accent bold', text:'$ Loading Grok-3...', delay:300},
    {type:'thinking', cls:'grok', text:'Thinking', duration:1800},
    {type:'line', cls:'success', text:'  Grok-3 loaded. Real-time X data enabled.', delay:200},
    {type:'blank', delay:300},
    {type:'line', cls:'accent bold', text:'$ Loading Claude Opus 4...', delay:300},
    {type:'thinking', cls:'claude', text:'Thinking', duration:2500},
    {type:'line', cls:'success', text:'  Claude Opus 4 loaded. Extended thinking active.', delay:200},
    {type:'blank', delay:400},
    {type:'line', cls:'accent bold', text:'$ python deploy.py --production', delay:400},
    {type:'line', cls:'dim', text:'  Building optimized bundle...', delay:600},
    {type:'line', cls:'dim', text:'  Running 847 tests...', delay:800},
    {type:'line', cls:'success bold', text:'  All tests passed.', delay:300},
    {type:'line', cls:'dim', text:'  Deploying to edge nodes...', delay:500},
    {type:'line', cls:'success bold', text:'  Deployed in 3 regions.', delay:300},
    {type:'blank', delay:400},
    {type:'line', cls:'accent bold', text:'$ neofetch', delay:300},
    {type:'line', cls:'', text:'  OS: Developer      CPU: Caffeine x86_64', delay:200},
    {type:'line', cls:'', text:'  Shell: bash         Uptime: 10,000+ commits', delay:200},
    {type:'line', cls:'', text:'  Languages: JS, TS, Python, Bash', delay:200},
    {type:'blank', delay:500},
    {type:'line', cls:'success bold', text:'> System ready. Awaiting instructions...', delay:0},
  ];

  var started = false;
  var currentLine = null;
  var currentSpan = null;

  function addLine(cls, isCmd){
    var div = document.createElement('div');
    div.className = 'terminal-line';
    if(isCmd){
      div.innerHTML = '<span class="terminal-prompt">$</span> ';
    }
    var span = document.createElement('span');
    span.className = 'terminal-text' + (cls ? ' ' + cls : '');
    div.appendChild(span);
    body.appendChild(div);
    return span;
  }

  function addBlank(){
    var div = document.createElement('div');
    div.className = 'terminal-line';
    div.innerHTML = '&nbsp;';
    body.appendChild(div);
  }

  function scrollBottom(){
    body.scrollTop = body.scrollHeight;
  }

  function typeText(span, text, charDelay, callback){
    var i = 0;
    function next(){
      if(i < text.length){
        span.textContent += text[i];
        i++;
        scrollBottom();
        setTimeout(next, charDelay + Math.random() * 20);
      } else {
        callback();
      }
    }
    next();
  }

  function runThinking(span, label, duration, callback){
    var dots = 0;
    span.textContent = label;
    var dotsSpan = document.createElement('span');
    dotsSpan.className = 'thinking-dots';
    span.appendChild(dotsSpan);
    var interval = setInterval(function(){
      dots = (dots + 1) % 4;
      dotsSpan.textContent = '.'.repeat(dots);
      scrollBottom();
    }, 400);
    setTimeout(function(){
      clearInterval(interval);
      span.textContent = label + '...';
      callback();
    }, duration);
  }

  function runSequence(index){
    if(index >= sequences.length){
      var cursor = body.querySelector('.terminal-cursor');
      if(cursor) cursor.style.display = 'none';
      return;
    }
    var step = sequences[index];
    setTimeout(function(){
      switch(step.type){
        case 'cmd':
          var span = addLine('', true);
          typeText(span, step.text, 45, function(){ runSequence(index + 1); });
          break;
        case 'line':
          var span = addLine(step.cls, false);
          typeText(span, step.text, 18, function(){ runSequence(index + 1); });
          break;
        case 'thinking':
          var span = addLine(step.cls, false);
          runThinking(span, step.text, step.duration, function(){ runSequence(index + 1); });
          break;
        case 'blank':
          addBlank();
          runSequence(index + 1);
          break;
      }
    }, step.delay);
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting && !started){
        started = true;
        body.innerHTML = '';
        var cursor = document.createElement('span');
        cursor.className = 'terminal-cursor';
        cursor.textContent = '_';
        var initLine = document.createElement('div');
        initLine.className = 'terminal-line';
        initLine.appendChild(cursor);
        body.appendChild(initLine);
        currentLine = initLine;
        setTimeout(function(){ runSequence(0); }, 500);
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.3});
  observer.observe(body.closest('.terminal-wrapper'));
})();
