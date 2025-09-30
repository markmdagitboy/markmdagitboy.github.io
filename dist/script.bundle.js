// Minimal runtime to restore interactivity (nav buttons, tab switching, blog links)
(function(){
  'use strict';
  function showTab(tabId){
    var btns = Array.prototype.slice.call(document.querySelectorAll('.nav button'));
    btns.forEach(function(btn){
      var isActive = btn.getAttribute('data-tab') === tabId;
      if(isActive) btn.classList.add('active'); else btn.classList.remove('active');
      btn.setAttribute('aria-pressed', String(isActive));
    });
    var sections = Array.prototype.slice.call(document.querySelectorAll('.content .section'));
    sections.forEach(function(section){
      if(section.id === tabId) section.classList.remove('hidden'); else section.classList.add('hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var nav = document.querySelector('.nav');
    // Determine initial tab from .nav button.active or default to 'skills'
    var activeBtn = document.querySelector('.nav button.active');
    var initial = (activeBtn && activeBtn.getAttribute('data-tab')) || 'skills';
    showTab(initial);

    if(nav){
      nav.addEventListener('click', function(e){
        var target = e.target;
        if(!target) return;
        var button = target.closest ? target.closest('button[data-tab]') : (function(){
          // fallback: walk up DOM
          var el = target;
          while(el && el !== nav){ if(el.tagName === 'BUTTON' && el.hasAttribute('data-tab')) return el; el = el.parentNode; }
          return null;
        })();
        if(!button) return;
        var tab = button.getAttribute('data-tab');
        showTab(tab);
      }, false);
    }

    // Basic blog link loader (same behavior as original site JS)
    var blogLinks = Array.prototype.slice.call(document.querySelectorAll('.blog-link'));
    var blogSection = document.getElementById('blog');
    var blogPostSection = document.getElementById('blog-post');
    blogLinks.forEach(function(link){
      link.addEventListener('click', function(e){
        e.preventDefault();
        var url = link.getAttribute('href');
        if(!url || !blogSection || !blogPostSection) return;
        fetch(url).then(function(resp){
          if(!resp.ok) throw new Error('HTTP error');
          return resp.text();
        }).then(function(content){
          blogPostSection.innerHTML = content;
          blogSection.classList.add('hidden');
          blogPostSection.classList.remove('hidden');
        }).catch(function(){
          blogPostSection.innerHTML = '<p>Sorry, there was an error loading the blog post. Please try again later.</p><button class="back-to-blog">Back to Blog</button>';
          blogSection.classList.add('hidden');
          blogPostSection.classList.remove('hidden');
        });
      }, false);
    });

    if(blogPostSection){
      blogPostSection.addEventListener('click', function(e){
        var el = e.target;
        if(el && el.classList && el.classList.contains('back-to-blog')){
          if(blogSection && blogPostSection){
            blogPostSection.classList.add('hidden');
            blogSection.classList.remove('hidden');
            blogPostSection.innerHTML = '';
          }
        }
      }, false);
    }
  });
})();
