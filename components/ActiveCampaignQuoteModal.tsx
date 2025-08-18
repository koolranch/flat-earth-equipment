"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  product: { name: string; slug: string; sku?: string | null };
};

export default function ActiveCampaignQuoteModal({ open, onClose, product }: Props) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  useEffect(() => {
    // Load ActiveCampaign form script when modal opens
    if (open) {
      const script = document.createElement('script');
      script.innerHTML = `
        window.cfields = [];
        window._show_thank_you = function(id, message, trackcmp_url, email) {
            var form = document.getElementById('_form_' + id + '_'), thank_you = form.querySelector('._form-thank-you');
            form.querySelector('._form-content').style.display = 'none';
            thank_you.innerHTML = message;
            thank_you.style.display = 'block';
            const vgoAlias = typeof visitorGlobalObjectAlias === 'undefined' ? 'vgo' : visitorGlobalObjectAlias;
            var visitorObject = window[vgoAlias];
            if (email && typeof visitorObject !== 'undefined') {
                visitorObject('setEmail', email);
                visitorObject('update');
            } else if (typeof(trackcmp_url) != 'undefined' && trackcmp_url) {
                _load_script(trackcmp_url);
            }
            if (typeof window._form_callback !== 'undefined') window._form_callback(id);
            
            // Close modal after successful submission
            setTimeout(() => {
              const closeBtn = document.querySelector('[data-quote-modal-close]');
              if (closeBtn) closeBtn.click();
            }, 2000);
        };
        // ... rest of ActiveCampaign script functions
      `;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [open]);

  if (!open) return null;

  const formHTML = `
    <style>
      @import url(https://fonts.bunny.net/css?family=ibm-plex-sans:400,600);
      
      /* Custom styles to integrate with your modal design */
      #_form_1_ { 
        font-size: 14px; 
        line-height: 1.6; 
        font-family: inherit; 
        margin: 0;
        background: transparent !important;
        border: 0 !important;
        padding: 0 !important;
        max-width: none !important;
        border-radius: 0 !important;
      }
      #_form_1_ * { outline: 0; }
      ._form_hide { display: none; visibility: hidden; }
      ._form_show { display: block; visibility: visible; }
      
      #_form_1_ input[type="text"],
      #_form_1_ input[type="tel"],
      #_form_1_ input[type="date"],
      #_form_1_ textarea {
        padding: 8px 12px;
        height: auto;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        color: #000 !important;
        font-size: 14px;
        width: 100%;
        box-sizing: border-box;
      }
      
      #_form_1_ ._submit {
        -webkit-appearance: none;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        background: #000000 !important;
        border: 0 !important;
        border-radius: 12px !important;
        color: #FFFFFF !important;
        padding: 10px 16px !important;
        transition: background-color 0.2s;
      }
      
      #_form_1_ ._submit:hover {
        background: #374151 !important;
      }
      
      #_form_1_ ._submit:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
      
      #_form_1_ ._form_element {
        position: relative;
        margin-bottom: 16px;
        font-size: 0;
        max-width: 100%;
      }
      
      #_form_1_ ._form_element * {
        font-size: 14px;
      }
      
      #_form_1_ ._form-label {
        font-weight: 500;
        margin-bottom: 6px;
        display: block;
        color: #374151;
      }
      
      #_form_1_ ._html-code p {
        margin: 0 0 16px 0;
        color: #6b7280;
        font-size: 14px;
      }
      
      #_form_1_ ._form-thank-you {
        position: relative;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 16px;
        color: #059669;
        padding: 20px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 12px;
        margin: 16px 0;
      }
      
      #_form_1_ ._error-inner {
        padding: 8px 12px;
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        color: #dc2626;
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      #_form_1_ ._form-branding {
        margin-top: 16px;
        font-size: 12px;
        color: #9ca3af;
        text-align: center;
      }
      
      #_form_1_ ._form-branding ._logo {
        display: inline-block;
        width: 100px;
        height: 12px;
        background-image: url("https://d226aj4ao1t61q.cloudfront.net/hh9ujqgv5_aclogo_li.png");
        background-size: 100px auto;
        background-repeat: no-repeat;
        margin-left: 4px;
      }
      
      .field-required {
        color: #dc2626;
      }
    </style>
    
    <form method="POST" action="https://flatearthequipment.activehosted.com/proc.php" id="_form_1_" class="_form _form_1 _inline-form _dark" novalidate data-styles-version="5">
      <input type="hidden" name="u" value="1" />
      <input type="hidden" name="f" value="1" />
      <input type="hidden" name="s" />
      <input type="hidden" name="c" value="0" />
      <input type="hidden" name="m" value="0" />
      <input type="hidden" name="act" value="sub" />
      <input type="hidden" name="v" value="2" />
      <input type="hidden" name="or" value="471f1fdb3c341aa6e90dbb571d373221" />
      
      <!-- Hidden fields for product context -->
      <input type="hidden" name="field[1]" value="${product.name}" />
      <input type="hidden" name="field[2]" value="${product.slug}" />
      <input type="hidden" name="field[3]" value="${product.sku || ''}" />
      
      <div class="_form-content">
        <div class="_form_element _x98753232 _full_width _clear">
          <div class="_html-code">
            <p>
              Request a quote for <strong>${product.name}</strong>. 
              We'll follow up to review your charger requirements.
            </p>
          </div>
        </div>
        
        <div class="_form_element _x45346975 _full_width">
          <label for="fullname" class="_form-label">
            Full Name
          </label>
          <div class="_field-wrapper">
            <input type="text" id="fullname" name="fullname" placeholder="Enter your full name" />
          </div>
        </div>
        
        <div class="_form_element _x81195953 _full_width">
          <label for="email" class="_form-label">
            Email<span class="field-required">*</span>
          </label>
          <div class="_field-wrapper">
            <input type="text" id="email" name="email" placeholder="Enter your email address" required />
          </div>
        </div>
        
        <div class="_button-wrapper _full_width">
          <button id="_form_1_submit" class="_submit" type="submit">
            Request Quote
          </button>
        </div>
        
        <div class="_clear-element"></div>
      </div>
      
      <div class="_form-thank-you" style="display:none;">
        <p>Thank you! We'll get back to you shortly with your charger quote.</p>
      </div>
      
      <div class="_form-branding">
        <div class="_marketing-by">Marketing by</div>
        <a href="https://www.activecampaign.com/?utm_medium=referral&utm_campaign=acforms" class="_logo">
          <span class="form-sr-only">ActiveCampaign</span>
        </a>
      </div>
    </form>
  `;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Request a Quote</h2>
            <p className="text-sm text-gray-600">{product.name}</p>
          </div>
          <button 
            onClick={onClose}
            data-quote-modal-close
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div dangerouslySetInnerHTML={{ __html: formHTML }} />
      </div>
      
      {/* ActiveCampaign Form Script */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.cfields = [];
        window._show_thank_you = function(id, message, trackcmp_url, email) {
            var form = document.getElementById('_form_' + id + '_'), thank_you = form.querySelector('._form-thank-you');
            form.querySelector('._form-content').style.display = 'none';
            thank_you.innerHTML = message || '<p>Thank you! We\\'ll get back to you shortly with your charger quote.</p>';
            thank_you.style.display = 'block';
            const vgoAlias = typeof visitorGlobalObjectAlias === 'undefined' ? 'vgo' : visitorGlobalObjectAlias;
            var visitorObject = window[vgoAlias];
            if (email && typeof visitorObject !== 'undefined') {
                visitorObject('setEmail', email);
                visitorObject('update');
            } else if (typeof(trackcmp_url) != 'undefined' && trackcmp_url) {
                _load_script(trackcmp_url);
            }
            if (typeof window._form_callback !== 'undefined') window._form_callback(id);
            
            // Auto-close modal after successful submission
            setTimeout(() => {
              const closeBtn = document.querySelector('[data-quote-modal-close]');
              if (closeBtn) closeBtn.click();
            }, 3000);
        };

        window._show_error = function(id, message, html) {
            var form = document.getElementById('_form_' + id + '_'),
                err = document.createElement('div'),
                button = form.querySelector('button[type="submit"]'),
                old_error = form.querySelector('._form_error');
            if (old_error) old_error.parentNode.removeChild(old_error);
            err.innerHTML = message;
            err.className = '_error-inner _form_error _no_arrow';
            var wrapper = document.createElement('div');
            wrapper.className = '_form-inner _show_be_error';
            wrapper.appendChild(err);
            button.parentNode.insertBefore(wrapper, button);
            var submitButton = form.querySelector('[id^="_form"][id$="_submit"]');
            submitButton.disabled = false;
            submitButton.classList.remove('processing');
            if (html) {
                var div = document.createElement('div');
                div.className = '_error-html';
                div.innerHTML = html;
                err.appendChild(div);
            }
        };

        window._load_script = function(url, callback, isSubmit) {
            var head = document.querySelector('head'), script = document.createElement('script'), r = false;
            var submitButton = document.querySelector('#_form_1_submit');
            script.charset = 'utf-8';
            script.src = url;
            if (callback) {
                script.onload = script.onreadystatechange = function() {
                    if (!r && (!this.readyState || this.readyState == 'complete')) {
                        r = true;
                        callback();
                    }
                };
            }
            script.onerror = function() {
                if (isSubmit) {
                    if (script.src.length > 10000) {
                        _show_error("1", "Sorry, your submission failed. Please shorten your responses and try again.");
                    } else {
                        _show_error("1", "Sorry, your submission failed. Please try again.");
                    }
                    submitButton.disabled = false;
                    submitButton.classList.remove('processing');
                }
            }
            head.appendChild(script);
        };

        // Form initialization and validation
        (function() {
            if (window.location.search.search("excludeform") !== -1) return false;
            
            var form_to_submit = document.getElementById('_form_1_');
            if (!form_to_submit) return;
            
            var allInputs = form_to_submit.querySelectorAll('input, select, textarea'), submitted = false;

            var validate_field = function(elem, remove) {
                var value = elem.value, no_error = true;
                if (elem.type != 'checkbox') elem.className = elem.className.replace(/ ?_has_error ?/g, '');
                
                if (elem.getAttribute('required') !== null) {
                    if (value === undefined || value === null || value === '') {
                        elem.className = elem.className + ' _has_error';
                        no_error = false;
                    }
                }
                
                if (no_error && elem.name == 'email') {
                    if (!value.match(/^[\\+_a-z0-9-'&=]+(\\.[\+_a-z0-9-']+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,})$/i)) {
                        elem.className = elem.className + ' _has_error';
                        no_error = false;
                    }
                }
                
                return no_error;
            };

            var validate_form = function(e) {
                var no_error = true;
                for (var i = 0, len = allInputs.length; i < len; i++) {
                    var input = allInputs[i];
                    if (input.getAttribute('required') !== null || input.name === 'email') {
                        if (input.tagName.toLowerCase() !== "select") {
                            input.value = input.value.trim();
                        }
                        validate_field(input) ? true : no_error = false;
                    }
                }
                if (!no_error && e) {
                    e.preventDefault();
                }
                return no_error;
            };

            var form_submit = function(e) {
                e.preventDefault();
                if (validate_form()) {
                    var submitButton = e.target.querySelector('#_form_1_submit');
                    submitButton.disabled = true;
                    submitButton.classList.add('processing');
                    
                    var formData = new FormData(form_to_submit);
                    
                    fetch('https://flatearthequipment.activehosted.com/proc.php?jsonp=true', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    }).then(response => response.json())
                    .then(data => {
                        if (data.result === 'success') {
                            _show_thank_you("1", "Thank you! We'll get back to you shortly with your charger quote.");
                        } else {
                            _show_error("1", "Sorry, your submission failed. Please try again.");
                        }
                    }).catch(() => {
                        // Fallback to script loading method
                        var serialized = Array.from(new FormData(form_to_submit))
                            .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
                            .join('&');
                        _load_script('https://flatearthequipment.activehosted.com/proc.php?' + serialized + '&jsonp=true', null, true);
                    });
                }
                return false;
            };
            
            form_to_submit.addEventListener('submit', form_submit);
        })();
      ` }} />
    </div>
  );
}
