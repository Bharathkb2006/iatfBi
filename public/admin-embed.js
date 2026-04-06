/* global window, document, localStorage */
(function () {
  'use strict';

  var LOGIN_KEY = 'biAdminLoggedIn';
  var CONTENT_KEY = 'biContent';

  function readContent() {
    try {
      return JSON.parse(localStorage.getItem(CONTENT_KEY)) || {};
    } catch (err) {
      return {};
    }
  }

  function writeContent(content) {
    normalizeContent(content);
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  }

  function normalizeContent(content) {
    if (!content || typeof content !== 'object') return;
    if (Array.isArray(content.suggestionImages)) {
      content.suggestionImages = content.suggestionImages.slice(0, 2);
    }
    if (Array.isArray(content.pdcaImages)) {
      content.pdcaImages = content.pdcaImages.slice(0, 2);
    }
    if (Array.isArray(content.noticeImages)) {
      content.noticeImages = content.noticeImages.slice(0, 6);
    }
    if (Array.isArray(content.safetyPosters)) {
      content.safetyPosters = content.safetyPosters.slice(0, 6);
    }
    if (Array.isArray(content.guestsMulti)) {
      content.guestsMulti = content.guestsMulti.slice(0, 5);
    }
    // Remove legacy safety video blobs stored in localStorage
    if (content.safetyPledgeVideo) delete content.safetyPledgeVideo;
    if (content.safetyAwarenessVideos) delete content.safetyAwarenessVideos;
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(file);
    });
  }

  function openMediaDb() {
    return new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      var request = window.indexedDB.open('biMedia', 1);
      request.onupgradeneeded = function (event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
      request.onsuccess = function (event) { resolve(event.target.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  function storeMediaFile(key, file) {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('files', 'readwrite');
        var store = tx.objectStore('files');
        store.delete(key);
        store.put(file, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error); };
      });
    });
  }

  function clearMediaDb() {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').clear();
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error); };
      });
    });
  }

  function formatDate(value) {
    if (!value) return '';
    var date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function setStatus(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('is-error', Boolean(isError));
  }

  function toggleRequiredSave(saveBtn, isReady) {
    if (!saveBtn) return;
    saveBtn.disabled = !isReady;
    saveBtn.classList.toggle('is-hidden', !isReady);
  }

  function requireFields(inputs) {
    return inputs.every(function (input) {
      if (!input) return false;
      if (input.type === 'file') return input.files && input.files.length > 0;
      return input.value.trim().length > 0;
    });
  }

  function setupLogin() {
    var loginForm = document.getElementById('adminLoginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var username = document.getElementById('adminUsername').value.trim();
      var password = document.getElementById('adminPassword').value.trim();
      var errorEl = document.getElementById('adminLoginError');

      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem(LOGIN_KEY, 'true');
        window.location.assign('/admin/dashboard');
      } else {
        setStatus(errorEl, 'Invalid credentials.', true);
      }
    });
  }

  function setupDashboard() {
    var logoutBtn = document.getElementById('adminLogout');
    if (!logoutBtn) return;

    if (localStorage.getItem(LOGIN_KEY) !== 'true') {
      (window.top || window).location.assign('/admin/login');
      return;
    }

    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem(LOGIN_KEY);
      (window.top || window).location.assign('/');
    });

    var clearBtn = document.getElementById('adminClearStorage');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        clearBtn.disabled = true;
        clearBtn.textContent = 'Clearing...';
        clearMediaDb().catch(function () {})
          .then(function () {
            localStorage.removeItem(CONTENT_KEY);
            setStatus(document.getElementById('safetyStatus'), 'Stored files cleared.', false);
            setStatus(document.getElementById('noticeStatus'), '', false);
            setStatus(document.getElementById('suggestionStatus'), '', false);
            setStatus(document.getElementById('guestStatus'), '', false);
            setStatus(document.getElementById('guestsStatus'), '', false);
            setStatus(document.getElementById('employeeStatus'), '', false);
            setStatus(document.getElementById('birthdayStatus'), '', false);
            setStatus(document.getElementById('pdcaStatus'), '', false);
            setStatus(document.getElementById('recognitionStatus'), '', false);
            setStatus(document.getElementById('achievementStatus'), '', false);
          })
          .finally(function () {
            clearBtn.disabled = false;
            clearBtn.textContent = 'Clear Stored Files';
          });
      });
    }

    var content = readContent();

    // IATF Settings Form
    var iatfBannerTitleInput = document.getElementById('iatfBannerTitle');
    var iatfSave = document.getElementById('iatfSave');
    var iatfStatus = document.getElementById('iatfStatus');

    if (iatfBannerTitleInput && iatfSave && iatfStatus) {
      // Load existing value
      var savedIatfTitle = localStorage.getItem('biIatfBannerTitle');
      if (savedIatfTitle) {
        iatfBannerTitleInput.value = savedIatfTitle;
      }

      // Track changes
      iatfBannerTitleInput.addEventListener('input', function () {
        iatfSave.disabled = !iatfBannerTitleInput.value.trim();
      });

      iatfSave.disabled = !iatfBannerTitleInput.value.trim();

      // Save handler
      iatfSave.addEventListener('click', function () {
        var title = iatfBannerTitleInput.value.trim();
        if (!title) {
          setStatus(iatfStatus, 'Please enter a title.', true);
          return;
        }
        localStorage.setItem('biIatfBannerTitle', title);
        setStatus(iatfStatus, 'IATF settings updated.', false);
      });
    }


    var guestInputs = [
      document.getElementById('guestName'),
      document.getElementById('guestRole'),
      document.getElementById('guestDateInput'),
      document.getElementById('guestImage')
    ];
    var guestSave = document.getElementById('guestSave');
    var guestStatus = document.getElementById('guestStatus');
    guestInputs.forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', function () {
        toggleRequiredSave(guestSave, requireFields(guestInputs.filter(Boolean)));
      });
      input.addEventListener('change', function () {
        toggleRequiredSave(guestSave, requireFields(guestInputs.filter(Boolean)));
      });
    });
    if (guestSave && guestInputs.some(Boolean)) {
      toggleRequiredSave(guestSave, requireFields(guestInputs.filter(Boolean)));
      guestSave.addEventListener('click', function () {
        var imageInput = guestInputs[3];
        if (!imageInput || !imageInput.files || !imageInput.files[0]) {
          setStatus(guestStatus, 'Please select a guest image.', true);
          return;
        }
        var file = imageInput.files[0];
        var companyLogoInput = document.getElementById('guestCompanyLogo');
        var companyLogoFile = companyLogoInput && companyLogoInput.files && companyLogoInput.files[0];

        fileToDataUrl(file).then(function (dataUrl) {
          content.guest = {
            name: guestInputs[0] ? guestInputs[0].value.trim() : '',
            role: guestInputs[1] ? guestInputs[1].value.trim() : '',
            date: guestInputs[2] ? formatDate(guestInputs[2].value) : '',
            image: dataUrl
          };
          if (companyLogoFile) {
            return fileToDataUrl(companyLogoFile).then(function (logoUrl) {
              content.companyLogo = logoUrl;
            }).catch(function () { /* keep existing logo on failure */ });
          }
        }).then(function () {
          writeContent(content);
          setStatus(guestStatus, 'Guest page updated.', false);
        }).catch(function () {
          setStatus(guestStatus, 'Failed to read guest image.', true);
        });
      });
    }

    var guestsNameInputs = [
      document.getElementById('guestsName1'),
      document.getElementById('guestsName2'),
      document.getElementById('guestsName3'),
      document.getElementById('guestsName4'),
      document.getElementById('guestsName5')
    ];
    var guestsRoleInputs = [
      document.getElementById('guestsRole1'),
      document.getElementById('guestsRole2'),
      document.getElementById('guestsRole3'),
      document.getElementById('guestsRole4'),
      document.getElementById('guestsRole5')
    ];
    var guestsImageInputs = [
      document.getElementById('guestsImage1'),
      document.getElementById('guestsImage2'),
      document.getElementById('guestsImage3'),
      document.getElementById('guestsImage4'),
      document.getElementById('guestsImage5')
    ];
    var guestsDateInput = document.getElementById('guestsDateInput');
    var guestsSave = document.getElementById('guestsSave');
    var guestsStatus = document.getElementById('guestsStatus');

    function computeGuestRows() {
      var rows = [];
      var hasPartial = false;

      for (var i = 0; i < guestsNameInputs.length; i++) {
        var nameInput = guestsNameInputs[i];
        var roleInput = guestsRoleInputs[i];
        var imageInput = guestsImageInputs[i];

        if (!nameInput || !roleInput || !imageInput) continue;

        var name = nameInput.value.trim();
        var role = roleInput.value.trim();
        var hasFile = imageInput.files && imageInput.files.length > 0;
        var anyFilled = name || role || hasFile;
        var allFilled = name && role && hasFile;

        if (anyFilled && !allFilled) {
          hasPartial = true;
        }

        if (allFilled) {
          rows.push({
            name: name,
            role: role,
            file: imageInput.files[0]
          });
        }
      }

      return { rows: rows, hasPartial: hasPartial };
    }

    function updateGuestsSaveState() {
      if (!guestsSave) return;
      var result = computeGuestRows();
      var rows = result.rows;
      var hasPartial = result.hasPartial;
      var ready = !hasPartial && rows.length >= 2 && rows.length <= 5;

      toggleRequiredSave(guestsSave, ready);

      if (!guestsStatus) return;

      if (hasPartial) {
        setStatus(guestsStatus, 'For each used guest row, fill Name, Role and Image.', true);
      } else if (rows.length > 0 && rows.length < 2) {
        setStatus(guestsStatus, 'Add at least two complete guests.', true);
      } else {
        setStatus(guestsStatus, '', false);
      }
    }

    guestsNameInputs.concat(guestsRoleInputs, guestsImageInputs).forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', updateGuestsSaveState);
      input.addEventListener('change', updateGuestsSaveState);
    });
    updateGuestsSaveState();

    if (guestsSave) {
      guestsSave.addEventListener('click', function () {
        var result = computeGuestRows();
        var rows = result.rows;

        if (result.hasPartial || rows.length < 2) {
          updateGuestsSaveState();
          return;
        }

        var updates = rows.map(function (row) {
          return fileToDataUrl(row.file).then(function (dataUrl) {
            return {
              name: row.name,
              role: row.role,
              image: dataUrl
            };
          });
        });

        Promise.all(updates).then(function (guestsData) {
          content.guestsMulti = guestsData;
          var guestsCompanyLogoInput = document.getElementById('guestsCompanyLogo');
          var guestsLogoFile = guestsCompanyLogoInput && guestsCompanyLogoInput.files && guestsCompanyLogoInput.files[0];
          if (guestsLogoFile) {
            return fileToDataUrl(guestsLogoFile).then(function (logoUrl) {
              content.guestsCompanyLogo = logoUrl;
            }).catch(function () { /* keep existing */ });
          }
        }).then(function () {
          writeContent(content);
          setStatus(guestsStatus, 'Guests updated.', false);
        }).catch(function () {
          setStatus(guestsStatus, 'Failed to read one or more guest images.', true);
        });
      });
    }

    var noticeInputs = [
      document.getElementById('noticeImg1'),
      document.getElementById('noticeImg2'),
      document.getElementById('noticeImg3'),
      document.getElementById('noticeImg4'),
      document.getElementById('noticeImg5'),
      document.getElementById('noticeImg6')
    ];
    var noticeSave = document.getElementById('noticeSave');
    var noticeStatus = document.getElementById('noticeStatus');

    function anyNoticeSelected() {
      return noticeInputs.some(function (input) {
        return input && input.files && input.files.length > 0;
      });
    }

    noticeInputs.forEach(function (input) {
      if (!input) return;
      input.addEventListener('change', function () {
        toggleRequiredSave(noticeSave, anyNoticeSelected());
      });
    });
    if (noticeSave) {
      toggleRequiredSave(noticeSave, anyNoticeSelected());
      noticeSave.addEventListener('click', function () {
        if (!anyNoticeSelected()) {
          setStatus(noticeStatus, 'Select at least one notice image to update.', true);
          return;
        }
        if (!content.noticeImages) content.noticeImages = [];
        var updates = [];
        noticeInputs.forEach(function (input, index) {
          if (!input || !input.files || !input.files[0]) return;
          var file = input.files[0];
          updates.push(fileToDataUrl(file).then(function (url) {
            content.noticeImages[index] = url;
          }));
        });
        Promise.all(updates).then(function () {
          writeContent(content);
          setStatus(noticeStatus, 'Notice images updated.', false);
        }).catch(function () {
          setStatus(noticeStatus, 'Failed to read notice images.', true);
        });
      });
    }

    var suggestionSave = document.getElementById('suggestionSave');
    var suggestionStatus = document.getElementById('suggestionStatus');
    if (suggestionSave) {
      suggestionSave.addEventListener('click', function () {
        var updates = [];
        var img1Input = document.getElementById('suggestionImg1');
        var img1 = img1Input && img1Input.files && img1Input.files[0];
        if (!img1) {
          setStatus(suggestionStatus, 'Select an image to update.', true);
          return;
        }
        if (!content.suggestionImages) content.suggestionImages = [];
        updates.push(fileToDataUrl(img1).then(function (url) { content.suggestionImages[0] = url; }));
        Promise.all(updates).then(function () {
          writeContent(content);
          setStatus(suggestionStatus, 'Suggestion images updated.', false);
        }).catch(function () {
          setStatus(suggestionStatus, 'Failed to read suggestion images.', true);
        });
      });
    }

    var suggestStatsSave = document.getElementById('suggestStatsSave');
    var suggestStatsReset = document.getElementById('suggestStatsReset');
    var suggestStatsStatus = document.getElementById('suggestStatsStatus');
    if (suggestStatsSave) {
      (function initSuggestionStatsForm() {
        var existing = content.suggestionStats || null;
        if (!existing) return;

        var chartTitleInput = document.getElementById('suggestChartTitle');
        var yAxisLabelInput = document.getElementById('suggestYAxisLabel');
        var prevLabelInput = document.getElementById('suggestPrevLabel');
        var prevTotalInput = document.getElementById('suggestPrevTotal');

        if (chartTitleInput && typeof existing.chartTitle === 'string') {
          chartTitleInput.value = existing.chartTitle;
        }
        if (yAxisLabelInput && typeof existing.yAxisLabel === 'string') {
          yAxisLabelInput.value = existing.yAxisLabel;
        }

        if (existing.previousYear) {
          if (prevLabelInput) prevLabelInput.value = existing.previousYear.label || '';
          if (prevTotalInput && typeof existing.previousYear.total !== 'undefined') {
            prevTotalInput.value = existing.previousYear.total;
          }
        }
        if (existing.months && existing.months.length === 12) {
          var monthIds = [
            'suggestApr',
            'suggestMay',
            'suggestJun',
            'suggestJul',
            'suggestAug',
            'suggestSep',
            'suggestOct',
            'suggestNov',
            'suggestDec',
            'suggestJan',
            'suggestFeb',
            'suggestMar'
          ];
          monthIds.forEach(function (id, index) {
            var input = document.getElementById(id);
            if (!input) return;
            var m = existing.months[index];
            if (!m) return;
            if (typeof m.value !== 'undefined') {
              input.value = m.value;
            }
          });
        }
      })();

      suggestStatsSave.addEventListener('click', function () {
        var existingStats = content.suggestionStats || {};
        var hasExisting = Boolean(existingStats && Object.keys(existingStats).length);

        var chartTitleInput = document.getElementById('suggestChartTitle');
        var yAxisLabelInput = document.getElementById('suggestYAxisLabel');
        var prevLabelInput = document.getElementById('suggestPrevLabel');
        var prevTotalInput = document.getElementById('suggestPrevTotal');

        var chartTitleRaw = chartTitleInput ? chartTitleInput.value.trim() : '';
        var yAxisLabelRaw = yAxisLabelInput ? yAxisLabelInput.value.trim() : '';
        var prevLabelRaw = prevLabelInput ? prevLabelInput.value.trim() : '';
        var prevTotalRaw = prevTotalInput ? prevTotalInput.value : '';

        function toNumberOrNull(raw) {
          var n = Number(raw);
          return Number.isFinite(n) && n >= 0 ? n : null;
        }

        var prevTotalNew = toNumberOrNull(prevTotalRaw);

        var monthConfig = [
          { id: 'suggestApr', label: 'Apr' },
          { id: 'suggestMay', label: 'May' },
          { id: 'suggestJun', label: 'Jun' },
          { id: 'suggestJul', label: 'Jul' },
          { id: 'suggestAug', label: 'Aug' },
          { id: 'suggestSep', label: 'Sep' },
          { id: 'suggestOct', label: 'Oct' },
          { id: 'suggestNov', label: 'Nov' },
          { id: 'suggestDec', label: 'Dec' },
          { id: 'suggestJan', label: 'Jan' },
          { id: 'suggestFeb', label: 'Feb' },
          { id: 'suggestMar', label: 'Mar' }
        ];

        var existingMonths = Array.isArray(existingStats.months) ? existingStats.months.slice(0, 12) : [];

        var months = monthConfig.map(function (cfg, index) {
          var input = document.getElementById(cfg.id);
          var raw = input ? input.value : '';
          var n = toNumberOrNull(raw);
          var existingMonth = existingMonths[index] || {};
          var existingValue = typeof existingMonth.value === 'number' ? existingMonth.value : 0;
          return {
            label: cfg.label,
            value: n !== null ? n : existingValue
          };
        });

        var prevLabel = prevLabelRaw || (existingStats.previousYear && existingStats.previousYear.label) || '';
        var prevTotal = prevTotalNew !== null
          ? prevTotalNew
          : (existingStats.previousYear && typeof existingStats.previousYear.total === 'number'
            ? existingStats.previousYear.total
            : 0);

        var anyNewInput = monthConfig.some(function (cfg) {
          var el = document.getElementById(cfg.id);
          return el && el.value;
        }) || prevLabelRaw || prevTotalRaw || chartTitleRaw || yAxisLabelRaw;

        if (!anyNewInput && !hasExisting) {
          setStatus(suggestStatsStatus, 'Enter at least one value before saving.', true);
          return;
        }

        content.suggestionStats = {
          chartTitle: chartTitleRaw || existingStats.chartTitle || '',
          yAxisLabel: yAxisLabelRaw || existingStats.yAxisLabel || '',
          previousYear: {
            label: prevLabel,
            total: prevTotal,
            seriesLabel: 'Previous Total'
          },
          currentSeriesLabel: 'Current Monthly',
          months: months
        };

        writeContent(content);
        setStatus(suggestStatsStatus, 'Suggestion statistics updated.', false);
      });

      if (suggestStatsReset) {
        suggestStatsReset.addEventListener('click', function () {
          delete content.suggestionStats;
          writeContent(content);

          var idsToClear = [
            'suggestPrevLabel',
            'suggestPrevTotal',
            'suggestApr',
            'suggestMay',
            'suggestJun',
            'suggestJul',
            'suggestAug',
            'suggestSep',
            'suggestOct',
            'suggestNov',
            'suggestDec',
            'suggestJan',
            'suggestFeb',
            'suggestMar'
          ];
          idsToClear.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
          });

          setStatus(suggestStatsStatus, 'Suggestion statistics reset. Enter new values to start a fresh graph.', false);
        });
      }
    }

    var employeeInputs = [
      document.getElementById('employeeName'),
      document.getElementById('employeeId'),
      document.getElementById('employeePhoto')
    ];
    var employeeSave = document.getElementById('employeeSave');
    var employeeStatus = document.getElementById('employeeStatus');
    employeeInputs.forEach(function (input) {
      if (!input || !employeeSave) return;
      input.addEventListener('input', function () {
        toggleRequiredSave(employeeSave, requireFields(employeeInputs.filter(Boolean)));
      });
      input.addEventListener('change', function () {
        toggleRequiredSave(employeeSave, requireFields(employeeInputs.filter(Boolean)));
      });
    });
    if (employeeSave && employeeInputs.some(Boolean)) {
      toggleRequiredSave(employeeSave, requireFields(employeeInputs.filter(Boolean)));
      employeeSave.addEventListener('click', function () {
        var photoInput = employeeInputs[2];
        if (!photoInput || !photoInput.files || !photoInput.files[0]) {
          setStatus(employeeStatus, 'Select an employee photo to update.', true);
          return;
        }
        var photo = photoInput.files[0];
        fileToDataUrl(photo).then(function (dataUrl) {
          content.employeeOfMonth = {
            name: employeeInputs[0] ? employeeInputs[0].value.trim() : '',
            id: employeeInputs[1] ? employeeInputs[1].value.trim() : '',
            photo: dataUrl
          };
          writeContent(content);
          setStatus(employeeStatus, 'Employee of the month updated.', false);
        }).catch(function () {
          setStatus(employeeStatus, 'Failed to read employee photo.', true);
        });
      });
    }

    var birthdayInputs = [
      document.getElementById('birthdayName'),
      document.getElementById('birthdayId'),
      document.getElementById('birthdayPhoto')
    ];
    var birthdaySave = document.getElementById('birthdaySave');
    var birthdayStatus = document.getElementById('birthdayStatus');
    birthdayInputs.forEach(function (input) {
      if (!input || !birthdaySave) return;
      input.addEventListener('input', function () {
        toggleRequiredSave(birthdaySave, requireFields(birthdayInputs.filter(Boolean)));
      });
      input.addEventListener('change', function () {
        toggleRequiredSave(birthdaySave, requireFields(birthdayInputs.filter(Boolean)));
      });
    });
    if (birthdaySave && birthdayInputs.some(Boolean)) {
      toggleRequiredSave(birthdaySave, requireFields(birthdayInputs.filter(Boolean)));
      birthdaySave.addEventListener('click', function () {
        var photoInput = birthdayInputs[2];
        if (!photoInput || !photoInput.files || !photoInput.files[0]) {
          setStatus(birthdayStatus, 'Select a birthday photo to update.', true);
          return;
        }
        var photo = photoInput.files[0];
        fileToDataUrl(photo).then(function (dataUrl) {
          content.birthday = {
            name: birthdayInputs[0] ? birthdayInputs[0].value.trim() : '',
            id: birthdayInputs[1] ? birthdayInputs[1].value.trim() : '',
            photo: dataUrl
          };
          writeContent(content);
          setStatus(birthdayStatus, 'Birthday updated.', false);
        }).catch(function () {
          setStatus(birthdayStatus, 'Failed to read birthday photo.', true);
        });
      });
    }

    var pdcaSave = document.getElementById('pdcaSave');
    var pdcaStatus = document.getElementById('pdcaStatus');
    if (pdcaSave) {
      pdcaSave.addEventListener('click', function () {
        var pdcaImg1 = document.getElementById('pdcaImg1');
        var pdcaImg2 = document.getElementById('pdcaImg2');
        var img1 = pdcaImg1 && pdcaImg1.files && pdcaImg1.files[0];
        var img2 = pdcaImg2 && pdcaImg2.files && pdcaImg2.files[0];
        if (!img1 && !img2) {
          setStatus(pdcaStatus, 'Select at least one image to update.', true);
          return;
        }
        if (!content.pdcaImages) content.pdcaImages = [];
        var updates = [];
        if (img1) updates.push(fileToDataUrl(img1).then(function (url) { content.pdcaImages[0] = url; }));
        if (img2) updates.push(fileToDataUrl(img2).then(function (url) { content.pdcaImages[1] = url; }));
        Promise.all(updates).then(function () {
          writeContent(content);
          setStatus(pdcaStatus, 'PDCA images updated.', false);
        }).catch(function () {
          setStatus(pdcaStatus, 'Failed to read PDCA images.', true);
        });
      });
    }

    var recognitionInputs = [
      document.getElementById('recognitionName'),
      document.getElementById('recognitionId'),
      document.getElementById('recognitionDate'),
      document.getElementById('recognitionLine'),
      document.getElementById('recognitionDefect'),
      document.getElementById('recognitionBenefit'),
      document.getElementById('recognitionPhoto')
    ];
    var recognitionSave = document.getElementById('recognitionSave');
    var recognitionStatus = document.getElementById('recognitionStatus');
    recognitionInputs.forEach(function (input) {
      if (!input || !recognitionSave) return;
      input.addEventListener('input', function () {
        toggleRequiredSave(recognitionSave, requireFields(recognitionInputs.filter(Boolean)));
      });
      input.addEventListener('change', function () {
        toggleRequiredSave(recognitionSave, requireFields(recognitionInputs.filter(Boolean)));
      });
    });
    if (recognitionSave && recognitionInputs.some(Boolean)) {
      toggleRequiredSave(recognitionSave, requireFields(recognitionInputs.filter(Boolean)));
      recognitionSave.addEventListener('click', function () {
        var photoInput = recognitionInputs[6];
        if (!photoInput || !photoInput.files || !photoInput.files[0]) {
          setStatus(recognitionStatus, 'Select a recognition photo to update.', true);
          return;
        }
        var photo = photoInput.files[0];
        fileToDataUrl(photo).then(function (dataUrl) {
          content.recognition = {
            name: recognitionInputs[0] ? recognitionInputs[0].value.trim() : '',
            id: recognitionInputs[1] ? recognitionInputs[1].value.trim() : '',
            date: recognitionInputs[2] ? formatDate(recognitionInputs[2].value) : '',
            line: recognitionInputs[3] ? recognitionInputs[3].value.trim() : '',
            defect: recognitionInputs[4] ? recognitionInputs[4].value.trim() : '',
            benefit: recognitionInputs[5] ? recognitionInputs[5].value.trim() : '',
            photo: dataUrl
          };
          writeContent(content);
          setStatus(recognitionStatus, 'Recognition updated.', false);
        }).catch(function () {
          setStatus(recognitionStatus, 'Failed to read recognition photo.', true);
        });
      });
    }

    var achievementSave = document.getElementById('achievementSave');
    var achievementStatus = document.getElementById('achievementStatus');
    if (achievementSave) {
      achievementSave.addEventListener('click', function () {
        var achievementImg = document.getElementById('achievementImg');
        var file = achievementImg && achievementImg.files && achievementImg.files[0];
        if (!file) {
          setStatus(achievementStatus, 'Select an image to update.', true);
          return;
        }
        fileToDataUrl(file).then(function (dataUrl) {
          content.achievementImage = dataUrl;
          writeContent(content);
          setStatus(achievementStatus, 'Achievement updated.', false);
        }).catch(function () {
          setStatus(achievementStatus, 'Failed to read achievement image.', true);
        });
      });
    }

    var safetySave = document.getElementById('safetySave');
    var safetyStatus = document.getElementById('safetyStatus');
    if (safetySave) {
      safetySave.addEventListener('click', function () {
      var updates = [];
      if (!content.safetyPosters) content.safetyPosters = [];
      var posterInputs = [
        document.getElementById('safetyPoster1'),
        document.getElementById('safetyPoster2'),
        document.getElementById('safetyPoster3'),
        document.getElementById('safetyPoster4'),
        document.getElementById('safetyPoster5'),
        document.getElementById('safetyPoster6')
      ];
      posterInputs.forEach(function (input, index) {
        if (!input || !input.files || !input.files[0]) return;
        var file = input.files[0];
        updates.push({
          label: 'Poster ' + (index + 1),
          promise: fileToDataUrl(file).then(function (url) { content.safetyPosters[index] = url; })
        });
      });
      var pledgeVideo = document.getElementById('safetyPledgeVideo').files[0];
      if (pledgeVideo) {
        updates.push({
          label: 'Pledge Video',
          promise: storeMediaFile('safetyPledgeVideo', pledgeVideo)
        });
        content.safetyPledgeVideoStored = true;
      }
      var awareness1 = document.getElementById('safetyAwarenessVideo1').files[0];
      if (awareness1) {
        updates.push({
          label: 'Awareness Video 1',
          promise: storeMediaFile('safetyAwarenessVideo1', awareness1)
        });
        content.safetyAwarenessVideo1Stored = true;
      }
      var awareness2 = document.getElementById('safetyAwarenessVideo2').files[0];
      if (awareness2) {
        updates.push({
          label: 'Awareness Video 2',
          promise: storeMediaFile('safetyAwarenessVideo2', awareness2)
        });
        content.safetyAwarenessVideo2Stored = true;
      }

      if (!updates.length) {
        setStatus(safetyStatus, 'Select at least one poster or video to update.', true);
        return;
      }

      Promise.allSettled(updates.map(function (item) { return item.promise; }))
        .then(function (results) {
          var failed = [];
          results.forEach(function (result, index) {
            if (result.status === 'rejected') failed.push(updates[index].label);
          });

          if (results.every(function (result) { return result.status === 'rejected'; })) {
            setStatus(safetyStatus, 'Failed to read safety files.', true);
            return;
          }

          try {
            writeContent(content);
            if (failed.length) {
              setStatus(safetyStatus, 'Updated with errors: ' + failed.join(', ') + '.', true);
            } else {
              setStatus(safetyStatus, 'Safety content updated.', false);
            }
          } catch (err) {
            setStatus(safetyStatus, 'Storage full. Try smaller files (especially videos).', true);
          }
        });
    });
    }
  }

  // Supply Module Settings with Dropdown and Table Interface
  function setupSupplyModule() {
    var selector = document.getElementById('supplyGraphSelector');
    var configPanel = document.getElementById('graphConfigPanel');
    var actionButtons = document.getElementById('graphActionButtons');
    var saveBtn = document.getElementById('supplyGraphSave');
    var clearBtn = document.getElementById('supplyGraphClear');
    var supplyStatus = document.getElementById('supplyStatus');

    if (!selector || !configPanel) {
      console.log('Supply module elements not found');
      return;
    }

    var currentGraphId = null;
    var originalData = {};
    var supplyData = { graphs: [] };

    // Initialize default data for 7 graphs
    function initializeDefaultData() {
      var defaults = [
        { title: 'Child Parts Line Stoppage (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Customer Line Stoppage (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Premium Freight (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Inventory Trend IDM Parts (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Supply Graph 5 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Supply Graph 6 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Supply Graph 7 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 }
      ];

      supplyData.graphs = [];
      for (var i = 0; i < 7; i++) {
        supplyData.graphs.push({
          id: 'graph' + (i + 1),
          title: defaults[i].title,
          yAxisLabel: defaults[i].yAxisLabel,
          yAxisUnit: '',
          yAxisMin: defaults[i].yAxisMin,
          yAxisMax: defaults[i].yAxisMax,
          target: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        });
      }
    }

    // Load existing supply data from localStorage
    function loadExistingData() {
      try {
        var existingData = JSON.parse(localStorage.getItem('biSupplyModuleData'));
        if (existingData && existingData.graphs && existingData.graphs.length > 0) {
          supplyData = JSON.parse(JSON.stringify(existingData)); // Deep copy
          return;
        }
      } catch (err) {
        console.log('Could not load existing data, using defaults');
      }
      initializeDefaultData();
    }

    // Load and initialize data
    loadExistingData();

    // Dropdown change handler
    selector.addEventListener('change', function () {
      var graphNum = this.value;
      console.log('Graph selected:', graphNum);
      
      if (!graphNum) {
        configPanel.style.display = 'none';
        return;
      }

      currentGraphId = 'graph' + graphNum;
      var graphIndex = parseInt(graphNum, 10) - 1;
      
      if (graphIndex < 0 || graphIndex >= supplyData.graphs.length) {
        console.log('Invalid graph index:', graphIndex);
        return;
      }

      var graphData = supplyData.graphs[graphIndex];
      console.log('Loading graph data:', graphData);

      // Load data into form inputs
      var titleInput = document.getElementById('configGraphTitle');
      var yLabelInput = document.getElementById('configYAxisLabel');
      var yMinInput = document.getElementById('configYAxisMin');
      var yMaxInput = document.getElementById('configYAxisMax');

      if (titleInput) titleInput.value = graphData.title || '';
      if (yLabelInput) yLabelInput.value = graphData.yAxisLabel || '';
      if (yMinInput) yMinInput.value = graphData.yAxisMin || 0;
      if (yMaxInput) yMaxInput.value = graphData.yAxisMax || 100;

      // Load data into table
      var targetInputs = document.querySelectorAll('.target-input');
      var actualInputs = document.querySelectorAll('.actual-input');

      console.log('Target inputs found:', targetInputs.length);
      console.log('Actual inputs found:', actualInputs.length);

      targetInputs.forEach(function (input, idx) {
        input.value = graphData.target[idx] || 0;
      });
      actualInputs.forEach(function (input, idx) {
        input.value = graphData.actual[idx] || 0;
      });

      // Store original data for comparison
      originalData = JSON.parse(JSON.stringify(graphData));

      // Show config panel and clear action buttons
      console.log('Showing config panel');
      configPanel.style.display = 'block';
      if (actionButtons) actionButtons.style.display = 'none';
    });

    // Track changes to show action buttons
    function trackChanges() {
      var titleInput = document.getElementById('configGraphTitle');
      var yLabelInput = document.getElementById('configYAxisLabel');
      var yMinInput = document.getElementById('configYAxisMin');
      var yMaxInput = document.getElementById('configYAxisMax');
      var targetInputs = document.querySelectorAll('.target-input');
      var actualInputs = document.querySelectorAll('.actual-input');

      var hasChanged = false;

      if (titleInput && titleInput.value !== originalData.title) hasChanged = true;
      if (yLabelInput && yLabelInput.value !== originalData.yAxisLabel) hasChanged = true;
      if (yMinInput && parseInt(yMinInput.value, 10) !== originalData.yAxisMin) hasChanged = true;
      if (yMaxInput && parseInt(yMaxInput.value, 10) !== originalData.yAxisMax) hasChanged = true;

      if (!hasChanged) {
        targetInputs.forEach(function (input, idx) {
          if (parseFloat(input.value) !== originalData.target[idx]) {
            hasChanged = true;
          }
        });
      }

      if (!hasChanged) {
        actualInputs.forEach(function (input, idx) {
          if (parseFloat(input.value) !== originalData.actual[idx]) {
            hasChanged = true;
          }
        });
      }

      if (hasChanged && actionButtons) {
        actionButtons.style.display = 'flex';
      } else if (actionButtons) {
        actionButtons.style.display = 'none';
      }
    }

    // Add change listeners to all inputs
    var configInputIds = ['configGraphTitle', 'configYAxisLabel', 'configYAxisMin', 'configYAxisMax'];
    configInputIds.forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        input.addEventListener('change', trackChanges);
        input.addEventListener('input', trackChanges);
      }
    });

    document.querySelectorAll('.target-input, .actual-input').forEach(function (input) {
      input.addEventListener('change', trackChanges);
      input.addEventListener('input', trackChanges);
    });

    // Save button handler
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (!currentGraphId) return;

        var graphIndex = parseInt(currentGraphId.substring(5), 10) - 1;
        var titleInput = document.getElementById('configGraphTitle');
        var yLabelInput = document.getElementById('configYAxisLabel');
        var yMinInput = document.getElementById('configYAxisMin');
        var yMaxInput = document.getElementById('configYAxisMax');
        var targetInputs = document.querySelectorAll('.target-input');
        var actualInputs = document.querySelectorAll('.actual-input');

        var target = [];
        var actual = [];

        targetInputs.forEach(function (input) {
          target.push(parseFloat(input.value) || 0);
        });
        actualInputs.forEach(function (input) {
          actual.push(parseFloat(input.value) || 0);
        });

        // Update graph data
        supplyData.graphs[graphIndex] = {
          id: currentGraphId,
          title: (titleInput && titleInput.value.trim()) || 'Supply Graph ' + (graphIndex + 1),
          yAxisLabel: (yLabelInput && yLabelInput.value.trim()) || 'Value',
          yAxisUnit: '',
          yAxisMin: (yMinInput && parseInt(yMinInput.value, 10)) || 0,
          yAxisMax: (yMaxInput && parseInt(yMaxInput.value, 10)) || 100,
          target: target,
          actual: actual
        };

        // Save to localStorage
        localStorage.setItem('biSupplyModuleData', JSON.stringify(supplyData));
        
        // Update original data
        originalData = JSON.parse(JSON.stringify(supplyData.graphs[graphIndex]));

        // Hide action buttons
        if (actionButtons) actionButtons.style.display = 'none';

        // Show status message
        if (supplyStatus) setStatus(supplyStatus, 'Graph ' + (graphIndex + 1) + ' saved successfully!', false);

        // Trigger update on frontend
        if (typeof window.updateSupplyModule === 'function') {
          window.updateSupplyModule();
        }
      });
    }

    // Clear button handler
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!currentGraphId) return;

        var graphIndex = parseInt(currentGraphId.substring(5), 10) - 1;

        // Reset to default data
        var defaults = [
          { title: 'Child Parts Line Stoppage (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
          { title: 'Customer Line Stoppage (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
          { title: 'Premium Freight (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
          { title: 'Inventory Trend IDM Parts (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
          { title: 'Supply Graph 5 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
          { title: 'Supply Graph 6 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
          { title: 'Supply Graph 7 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 }
        ];

        supplyData.graphs[graphIndex] = {
          id: currentGraphId,
          title: defaults[graphIndex].title,
          yAxisLabel: defaults[graphIndex].yAxisLabel,
          yAxisUnit: '',
          yAxisMin: defaults[graphIndex].yAxisMin,
          yAxisMax: defaults[graphIndex].yAxisMax,
          target: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        };

        // Save to localStorage
        localStorage.setItem('biSupplyModuleData', JSON.stringify(supplyData));

        // Reload the selected graph
        selector.value = '';
        selector.value = (graphIndex + 1).toString();
        selector.dispatchEvent(new Event('change'));

        // Show status message
        if (supplyStatus) setStatus(supplyStatus, 'Graph ' + (graphIndex + 1) + ' cleared successfully!', false);

        // Trigger update on frontend
        if (typeof window.updateSupplyModule === 'function') {
          window.updateSupplyModule();
        }
      });
    }

    console.log('Supply module initialized successfully');
  }

  // Quality Module Settings (same as Supply; Graphs 9–11 are single-line only, slide 3)
  function setupQualityModule() {
    var selector = document.getElementById('qualityGraphSelector');
    var configPanel = document.getElementById('qualityGraphConfigPanel');
    var actionButtons = document.getElementById('qualityGraphActionButtons');
    var dataTableWrap = document.getElementById('qualityDataTableWrap');
    var singleLineMeta = document.getElementById('qualitySingleLineMeta');
    var singleLineTableWrap = document.getElementById('qualitySingleLineTableWrap');
    var saveBtn = document.getElementById('qualityGraphSave');
    var clearBtn = document.getElementById('qualityGraphClear');
    var qualityStatus = document.getElementById('qualityStatus');

    if (!selector || !configPanel) return;

    var currentGraphId = null;
    var originalData = {};
    var qualityData = { graphs: [] };

    function getQualityDefaults() {
      var twoLine = [
        { title: 'Quality Graph 1 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Quality Graph 2 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Quality Graph 3 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Quality Graph 4 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Quality Graph 5 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Quality Graph 6 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Quality Graph 7 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 },
        { title: 'Quality Graph 8 (2025-26)', yAxisLabel: 'No. of Occasions', yAxisMin: 0, yAxisMax: 50 }
      ];
      var singleLine = [
        { title: 'Quality Single Line Chart 1 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 100, lineLabel: 'Value' },
        { title: 'Quality Single Line Chart 2 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 100, lineLabel: 'Value' },
        { title: 'Quality Single Line Chart 3 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 100, lineLabel: 'Value' }
      ];
      return { twoLine: twoLine, singleLine: singleLine };
    }

    function initializeDefaultData() {
      var defs = getQualityDefaults();
      qualityData.graphs = [];
      for (var i = 0; i < 8; i++) {
        qualityData.graphs.push({
          id: 'graph' + (i + 1),
          title: defs.twoLine[i].title,
          yAxisLabel: defs.twoLine[i].yAxisLabel,
          yAxisUnit: '',
          yAxisMin: defs.twoLine[i].yAxisMin,
          yAxisMax: defs.twoLine[i].yAxisMax,
          target: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        });
      }
      for (var j = 0; j < 3; j++) {
        qualityData.graphs.push({
          id: 'graph' + (9 + j),
          title: defs.singleLine[j].title,
          yAxisLabel: defs.singleLine[j].yAxisLabel,
          yAxisUnit: '',
          yAxisMin: defs.singleLine[j].yAxisMin,
          yAxisMax: defs.singleLine[j].yAxisMax,
          singleLine: true,
          lineLabel: defs.singleLine[j].lineLabel,
          value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        });
      }
    }

    function loadExistingData() {
      try {
        var existing = JSON.parse(localStorage.getItem('biQualityModuleData'));
        if (existing && existing.graphs) {
          if (existing.graphs.length >= 11) {
            qualityData = JSON.parse(JSON.stringify(existing));
            return;
          }
          if (existing.graphs.length === 9) {
            var defs = getQualityDefaults();
            qualityData = JSON.parse(JSON.stringify(existing));
            qualityData.graphs.push({
              id: 'graph10',
              title: defs.singleLine[1].title,
              yAxisLabel: defs.singleLine[1].yAxisLabel,
              yAxisUnit: '',
              yAxisMin: defs.singleLine[1].yAxisMin,
              yAxisMax: defs.singleLine[1].yAxisMax,
              singleLine: true,
              lineLabel: defs.singleLine[1].lineLabel,
              value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            });
            qualityData.graphs.push({
              id: 'graph11',
              title: defs.singleLine[2].title,
              yAxisLabel: defs.singleLine[2].yAxisLabel,
              yAxisUnit: '',
              yAxisMin: defs.singleLine[2].yAxisMin,
              yAxisMax: defs.singleLine[2].yAxisMax,
              singleLine: true,
              lineLabel: defs.singleLine[2].lineLabel,
              value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            });
            return;
          }
        }
      } catch (e) {}
      initializeDefaultData();
    }

    loadExistingData();

    selector.addEventListener('change', function () {
      var graphNum = this.value;
      if (!graphNum) {
        configPanel.style.display = 'none';
        return;
      }

      currentGraphId = 'graph' + graphNum;
      var graphIndex = parseInt(graphNum, 10) - 1;
      if (graphIndex < 0 || graphIndex >= qualityData.graphs.length) return;

      var graphData = qualityData.graphs[graphIndex];
      var isSingleLine = graphData.singleLine === true;

      var titleInput = document.getElementById('qualityConfigGraphTitle');
      var yLabelInput = document.getElementById('qualityConfigYAxisLabel');
      var yMinInput = document.getElementById('qualityConfigYAxisMin');
      var yMaxInput = document.getElementById('qualityConfigYAxisMax');

      if (titleInput) titleInput.value = graphData.title || '';
      if (yLabelInput) yLabelInput.value = graphData.yAxisLabel || '';
      if (yMinInput) yMinInput.value = graphData.yAxisMin != null ? graphData.yAxisMin : 0;
      if (yMaxInput) yMaxInput.value = graphData.yAxisMax != null ? graphData.yAxisMax : 100;

      if (isSingleLine) {
        if (dataTableWrap) dataTableWrap.style.display = 'none';
        if (singleLineMeta) singleLineMeta.style.display = 'block';
        if (singleLineTableWrap) singleLineTableWrap.style.display = 'block';
        var lineLabelInput = document.getElementById('qualityLineLabel');
        if (lineLabelInput) lineLabelInput.value = graphData.lineLabel || 'Value';
        var valueInputs = document.querySelectorAll('.quality-value-input');
        var valArr = Array.isArray(graphData.value) ? graphData.value : [];
        valueInputs.forEach(function (input, idx) {
          input.value = valArr[idx] != null ? valArr[idx] : 0;
        });
      } else {
        if (dataTableWrap) dataTableWrap.style.display = 'block';
        if (singleLineMeta) singleLineMeta.style.display = 'none';
        if (singleLineTableWrap) singleLineTableWrap.style.display = 'none';
        var targetInputs = document.querySelectorAll('.quality-target-input');
        var actualInputs = document.querySelectorAll('.quality-actual-input');
        targetInputs.forEach(function (input, idx) {
          input.value = graphData.target[idx] != null ? graphData.target[idx] : 0;
        });
        actualInputs.forEach(function (input, idx) {
          input.value = graphData.actual[idx] != null ? graphData.actual[idx] : 0;
        });
      }

      originalData = JSON.parse(JSON.stringify(graphData));
      configPanel.style.display = 'block';
      if (actionButtons) actionButtons.style.display = 'none';
    });

    function trackQualityChanges() {
      if (!currentGraphId) return;
      var graphIndex = parseInt(currentGraphId.replace('graph', ''), 10) - 1;
      var graphData = qualityData.graphs[graphIndex];
      var isSingleLine = graphData && graphData.singleLine === true;

      var titleInput = document.getElementById('qualityConfigGraphTitle');
      var yLabelInput = document.getElementById('qualityConfigYAxisLabel');
      var yMinInput = document.getElementById('qualityConfigYAxisMin');
      var yMaxInput = document.getElementById('qualityConfigYAxisMax');

      var hasChanged = false;
      if (titleInput && titleInput.value !== originalData.title) hasChanged = true;
      if (yLabelInput && yLabelInput.value !== originalData.yAxisLabel) hasChanged = true;
      if (yMinInput && Number(yMinInput.value) !== originalData.yAxisMin) hasChanged = true;
      if (yMaxInput && Number(yMaxInput.value) !== originalData.yAxisMax) hasChanged = true;

      if (isSingleLine) {
        var lineLabelInput = document.getElementById('qualityLineLabel');
        if (lineLabelInput && lineLabelInput.value !== (originalData.lineLabel || 'Value')) hasChanged = true;
        document.querySelectorAll('.quality-value-input').forEach(function (input, idx) {
          if (parseFloat(input.value) !== (originalData.value[idx] || 0)) hasChanged = true;
        });
      } else {
        document.querySelectorAll('.quality-target-input').forEach(function (input, idx) {
          if (parseFloat(input.value) !== (originalData.target[idx] || 0)) hasChanged = true;
        });
        document.querySelectorAll('.quality-actual-input').forEach(function (input, idx) {
          if (parseFloat(input.value) !== (originalData.actual[idx] || 0)) hasChanged = true;
        });
      }

      if (actionButtons) actionButtons.style.display = hasChanged ? 'flex' : 'none';
    }

    ['qualityConfigGraphTitle', 'qualityConfigYAxisLabel', 'qualityConfigYAxisMin', 'qualityConfigYAxisMax', 'qualityLineLabel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', trackQualityChanges);
        el.addEventListener('change', trackQualityChanges);
      }
    });
    document.querySelectorAll('.quality-target-input, .quality-actual-input, .quality-value-input').forEach(function (input) {
      input.addEventListener('input', trackQualityChanges);
      input.addEventListener('change', trackQualityChanges);
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (!currentGraphId) return;
        var graphIndex = parseInt(currentGraphId.replace('graph', ''), 10) - 1;
        var titleInput = document.getElementById('qualityConfigGraphTitle');
        var yLabelInput = document.getElementById('qualityConfigYAxisLabel');
        var yMinInput = document.getElementById('qualityConfigYAxisMin');
        var yMaxInput = document.getElementById('qualityConfigYAxisMax');

        if (graphIndex >= 8) {
          var lineLabelInput = document.getElementById('qualityLineLabel');
          var valueInputs = document.querySelectorAll('.quality-value-input');
          var value = [];
          valueInputs.forEach(function (input) { value.push(parseFloat(input.value) || 0); });
          qualityData.graphs[graphIndex] = {
            id: currentGraphId,
            title: (titleInput && titleInput.value.trim()) || 'Quality Single Line Chart',
            yAxisLabel: (yLabelInput && yLabelInput.value.trim()) || 'Value',
            yAxisUnit: '',
            yAxisMin: (yMinInput && parseInt(yMinInput.value, 10)) || 0,
            yAxisMax: (yMaxInput && parseInt(yMaxInput.value, 10)) || 100,
            singleLine: true,
            lineLabel: (lineLabelInput && lineLabelInput.value.trim()) || 'Value',
            value: value
          };
        } else {
          var targetInputs = document.querySelectorAll('.quality-target-input');
          var actualInputs = document.querySelectorAll('.quality-actual-input');
          var target = [], actual = [];
          targetInputs.forEach(function (input) { target.push(parseFloat(input.value) || 0); });
          actualInputs.forEach(function (input) { actual.push(parseFloat(input.value) || 0); });
          qualityData.graphs[graphIndex] = {
            id: currentGraphId,
            title: (titleInput && titleInput.value.trim()) || 'Quality Graph ' + (graphIndex + 1),
            yAxisLabel: (yLabelInput && yLabelInput.value.trim()) || 'Value',
            yAxisUnit: '',
            yAxisMin: (yMinInput && parseInt(yMinInput.value, 10)) || 0,
            yAxisMax: (yMaxInput && parseInt(yMaxInput.value, 10)) || 100,
            target: target,
            actual: actual
          };
        }

        localStorage.setItem('biQualityModuleData', JSON.stringify(qualityData));
        originalData = JSON.parse(JSON.stringify(qualityData.graphs[graphIndex]));
        if (actionButtons) actionButtons.style.display = 'none';
        if (qualityStatus) setStatus(qualityStatus, 'Graph ' + (graphIndex + 1) + ' saved successfully!', false);
        if (typeof window.updateQualityModule === 'function') window.updateQualityModule();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!currentGraphId) return;
        var graphIndex = parseInt(currentGraphId.replace('graph', ''), 10) - 1;
        var defs = getQualityDefaults();
        if (graphIndex >= 8) {
          var singleIdx = graphIndex - 8;
          qualityData.graphs[graphIndex] = {
            id: currentGraphId,
            title: defs.singleLine[singleIdx].title,
            yAxisLabel: defs.singleLine[singleIdx].yAxisLabel,
            yAxisUnit: '',
            yAxisMin: defs.singleLine[singleIdx].yAxisMin,
            yAxisMax: defs.singleLine[singleIdx].yAxisMax,
            singleLine: true,
            lineLabel: defs.singleLine[singleIdx].lineLabel,
            value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          };
        } else {
          qualityData.graphs[graphIndex] = {
            id: currentGraphId,
            title: defs.twoLine[graphIndex].title,
            yAxisLabel: defs.twoLine[graphIndex].yAxisLabel,
            yAxisUnit: '',
            yAxisMin: defs.twoLine[graphIndex].yAxisMin,
            yAxisMax: defs.twoLine[graphIndex].yAxisMax,
            target: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          };
        }
        localStorage.setItem('biQualityModuleData', JSON.stringify(qualityData));
        selector.value = '';
        selector.value = (graphIndex + 1).toString();
        selector.dispatchEvent(new Event('change'));
        if (qualityStatus) setStatus(qualityStatus, 'Graph ' + (graphIndex + 1) + ' cleared successfully!', false);
        if (typeof window.updateQualityModule === 'function') window.updateQualityModule();
      });
    }
  }

  // Maintenance Module: Graph 1 = bar+line, Graph 2 & 3 = stacked bar
  function setupMaintenanceModule() {
    var selector = document.getElementById('maintGraphSelector');
    var panel = document.getElementById('maintGraphConfigPanel');
    var graph1Fields = document.getElementById('maintGraph1Fields');
    var graph23Fields = document.getElementById('maintGraph2_3Fields');
    var saveBtn = document.getElementById('maintGraphSave');
    var clearBtn = document.getElementById('maintGraphClear');
    var statusEl = document.getElementById('maintStatus');

    if (!selector || !panel) return;

    var maintData = { graphs: [] };

    function getMaintDefaults() {
      return {
        graphs: [
          { id: 'maint1', title: 'Overall Equipment Breakdown', yAxisLabel: 'Breakdown Hours', yAxisMin: 0, yAxisMax: 70, bar1Label: 'Breakdown in Hrs', bar2Label: 'No of Occurrence', bar1Value: 11, bar2Value: 6, line1Label: 'Breakdown in Hrs (Monthly)', line2Label: 'No of Occ (Monthly)', line1: [0,0,0,0,0,0,0,0,0,0,0,0], line2: [0,0,0,0,0,0,0,0,0,0,0,0] },
          { id: 'maint2', title: 'Equipment Breakdown by Line (Hrs)', yAxisLabel: 'Breakdown Hours', yAxisMin: 0, yAxisMax: 18, series1Label: 'EHCU Assembly Line', series2Label: 'Cartridge Assembly Line', series1: [0,0,0,0,0,0,0,0,0,0,0,0], series2: [0,0,0,0,0,0,0,0,0,0,0,0] },
          { id: 'maint3', title: 'Equipment Breakdown Occurrence', yAxisLabel: 'Breakdown occurrence (nos)', yAxisMin: 0, yAxisMax: 18, series1Label: 'EHCU Assembly Line', series2Label: 'Others', series1: [0,0,0,0,0,0,0,0,0,0,0,0], series2: [0,0,0,0,0,0,0,0,0,0,0,0] }
        ]
      };
    }

    function loadMaintData() {
      try {
        var stored = JSON.parse(localStorage.getItem('biMaintenanceModuleData'));
        if (stored && stored.graphs && stored.graphs.length >= 3) {
          maintData = JSON.parse(JSON.stringify(stored));
          return;
        }
      } catch (e) {}
      maintData = getMaintDefaults();
    }

    function to12Arr(inputs) {
      var arr = [];
      for (var i = 0; i < 12; i++) {
        var el = document.querySelector(inputs + '[data-month="' + i + '"]');
        arr.push(el ? (parseFloat(el.value) || 0) : 0);
      }
      return arr;
    }

    function set12Arr(inputsSelector, arr) {
      var arr2 = Array.isArray(arr) ? arr.slice(0, 12) : [];
      for (var i = 0; i < 12; i++) {
        var el = document.querySelector(inputsSelector + '[data-month="' + i + '"]');
        if (el) el.value = arr2[i] != null ? arr2[i] : 0;
      }
    }

    loadMaintData();

    selector.addEventListener('change', function () {
      var num = this.value;
      if (!num) {
        panel.style.display = 'none';
        return;
      }
      var idx = parseInt(num, 10) - 1;
      var g = maintData.graphs[idx];
      if (!g) return;

      document.getElementById('maintConfigTitle').value = g.title || '';
      document.getElementById('maintConfigYAxisLabel').value = g.yAxisLabel || '';
      document.getElementById('maintConfigYAxisMin').value = g.yAxisMin != null ? g.yAxisMin : 0;
      document.getElementById('maintConfigYAxisMax').value = g.yAxisMax != null ? g.yAxisMax : 100;

      if (idx === 0) {
        graph1Fields.style.display = 'block';
        graph23Fields.style.display = 'none';
        document.getElementById('maintBar1Label').value = g.bar1Label || '';
        document.getElementById('maintBar2Label').value = g.bar2Label || '';
        document.getElementById('maintBar1Value').value = g.bar1Value != null ? g.bar1Value : 0;
        document.getElementById('maintBar2Value').value = g.bar2Value != null ? g.bar2Value : 0;
        document.getElementById('maintLine1Label').value = g.line1Label || '';
        document.getElementById('maintLine2Label').value = g.line2Label || '';
        set12Arr('.maint-line1-input', g.line1);
        set12Arr('.maint-line2-input', g.line2);
      } else {
        graph1Fields.style.display = 'none';
        graph23Fields.style.display = 'block';
        document.getElementById('maintSeries1Label').value = g.series1Label || '';
        document.getElementById('maintSeries2Label').value = g.series2Label || '';
        set12Arr('.maint-s1-input', g.series1);
        set12Arr('.maint-s2-input', g.series2);
      }
      panel.style.display = 'block';
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var num = selector.value;
        if (!num) return;
        var idx = parseInt(num, 10) - 1;
        var g = maintData.graphs[idx];
        if (!g) return;

        var title = document.getElementById('maintConfigTitle').value.trim();
        var yLabel = document.getElementById('maintConfigYAxisLabel').value.trim();
        var yMin = parseInt(document.getElementById('maintConfigYAxisMin').value, 10);
        var yMax = parseInt(document.getElementById('maintConfigYAxisMax').value, 10);

        if (idx === 0) {
          maintData.graphs[0] = {
            id: 'maint1',
            title: title || g.title,
            yAxisLabel: yLabel || g.yAxisLabel,
            yAxisMin: Number.isFinite(yMin) ? yMin : 0,
            yAxisMax: Number.isFinite(yMax) ? yMax : 70,
            bar1Label: document.getElementById('maintBar1Label').value.trim() || g.bar1Label,
            bar2Label: document.getElementById('maintBar2Label').value.trim() || g.bar2Label,
            bar1Value: parseFloat(document.getElementById('maintBar1Value').value) || 0,
            bar2Value: parseFloat(document.getElementById('maintBar2Value').value) || 0,
            line1Label: document.getElementById('maintLine1Label').value.trim() || g.line1Label,
            line2Label: document.getElementById('maintLine2Label').value.trim() || g.line2Label,
            line1: to12Arr('.maint-line1-input'),
            line2: to12Arr('.maint-line2-input')
          };
        } else {
          maintData.graphs[idx] = {
            id: g.id,
            title: title || g.title,
            yAxisLabel: yLabel || g.yAxisLabel,
            yAxisMin: Number.isFinite(yMin) ? yMin : 0,
            yAxisMax: Number.isFinite(yMax) ? yMax : 18,
            series1Label: document.getElementById('maintSeries1Label').value.trim() || g.series1Label,
            series2Label: document.getElementById('maintSeries2Label').value.trim() || g.series2Label,
            series1: to12Arr('.maint-s1-input'),
            series2: to12Arr('.maint-s2-input')
          };
        }
        localStorage.setItem('biMaintenanceModuleData', JSON.stringify(maintData));
        if (statusEl) setStatus(statusEl, 'Graph ' + (idx + 1) + ' saved.', false);
        if (typeof window.updateMaintenanceModule === 'function') window.updateMaintenanceModule();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        var num = selector.value;
        if (!num) return;
        var idx = parseInt(num, 10) - 1;
        var defs = getMaintDefaults();
        maintData.graphs[idx] = JSON.parse(JSON.stringify(defs.graphs[idx]));
        localStorage.setItem('biMaintenanceModuleData', JSON.stringify(maintData));
        selector.dispatchEvent(new Event('change'));
        if (statusEl) setStatus(statusEl, 'Graph ' + (idx + 1) + ' cleared.', false);
        if (typeof window.updateMaintenanceModule === 'function') window.updateMaintenanceModule();
      });
    }
  }

  // Production Module: Graph 1–3 = line (Target+Actual), Graph 4–5 = bar + line (editable year label + bar value)
  function setupProductionModule() {
    var selector = document.getElementById('prodGraphSelector');
    var panel = document.getElementById('prodGraphConfigPanel');
    var lineFields = document.getElementById('prodLineChartFields');
    var barLineFields = document.getElementById('prodBarLineFields');
    var saveBtn = document.getElementById('prodGraphSave');
    var clearBtn = document.getElementById('prodGraphClear');
    var statusEl = document.getElementById('prodStatus');

    if (!selector || !panel) return;

    var prodData = { graphs: [] };

    function getProdDefaults() {
      return {
        graphs: [
          { id: 'prod1', title: 'Production Graph 1 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, target: [10,10,10,10,10,10,10,10,10,10,10,10], actual: [0,0,0,0,0,0,0,0,0,0,0,0] },
          { id: 'prod2', title: 'Production Graph 2 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, target: [10,10,10,10,10,10,10,10,10,10,10,10], actual: [0,0,0,0,0,0,0,0,0,0,0,0] },
          { id: 'prod3', title: 'Production Graph 3 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, target: [10,10,10,10,10,10,10,10,10,10,10,10], actual: [0,0,0,0,0,0,0,0,0,0,0,0] },
          { id: 'prod4', title: 'Production Bar + Line 1 (2025-26)', yAxisLabel: 'Kaizens', yAxisMin: 0, yAxisMax: 50, barYearLabel: '2024-25', barValue: 43, lineLabel: 'Actual 25-26', line: [0,0,0,0,0,0,0,0,0,0,0,0] },
          { id: 'prod5', title: 'Production Bar + Line 2 (2025-26)', yAxisLabel: 'Kaizens', yAxisMin: 0, yAxisMax: 50, barYearLabel: '2024-25', barValue: 43, lineLabel: 'Actual 25-26', line: [0,0,0,0,0,0,0,0,0,0,0,0] }
        ]
      };
    }

    function loadProdData() {
      try {
        var stored = JSON.parse(localStorage.getItem('biProductionModuleData'));
        if (stored && stored.graphs && stored.graphs.length >= 5) {
          prodData = JSON.parse(JSON.stringify(stored));
          return;
        }
      } catch (e) {}
      prodData = getProdDefaults();
    }

    function to12Arr(selector) {
      var arr = [];
      for (var i = 0; i < 12; i++) {
        var el = document.querySelector(selector + '[data-month="' + i + '"]');
        arr.push(el ? (parseFloat(el.value) || 0) : 0);
      }
      return arr;
    }

    function set12Arr(selector, arr) {
      var a = Array.isArray(arr) ? arr.slice(0, 12) : [];
      for (var i = 0; i < 12; i++) {
        var el = document.querySelector(selector + '[data-month="' + i + '"]');
        if (el) el.value = a[i] != null ? a[i] : 0;
      }
    }

    loadProdData();

    selector.addEventListener('change', function () {
      var num = this.value;
      if (!num) { panel.style.display = 'none'; return; }
      var idx = parseInt(num, 10) - 1;
      var g = prodData.graphs[idx];
      if (!g) return;

      document.getElementById('prodConfigTitle').value = g.title || '';
      document.getElementById('prodConfigYAxisLabel').value = g.yAxisLabel || '';
      document.getElementById('prodConfigYAxisMin').value = g.yAxisMin != null ? g.yAxisMin : 0;
      document.getElementById('prodConfigYAxisMax').value = g.yAxisMax != null ? g.yAxisMax : 50;

      if (idx < 3) {
        lineFields.style.display = 'block';
        barLineFields.style.display = 'none';
        set12Arr('.prod-target-input', g.target);
        set12Arr('.prod-actual-input', g.actual);
      } else {
        lineFields.style.display = 'none';
        barLineFields.style.display = 'block';
        document.getElementById('prodBarYearLabel').value = g.barYearLabel || '2024-25';
        document.getElementById('prodBarValue').value = g.barValue != null ? g.barValue : 0;
        document.getElementById('prodLineLabel').value = g.lineLabel || 'Actual 25-26';
        set12Arr('.prod-line-input', g.line);
      }
      panel.style.display = 'block';
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var num = selector.value;
        if (!num) return;
        var idx = parseInt(num, 10) - 1;
        var g = prodData.graphs[idx];
        if (!g) return;

        var title = document.getElementById('prodConfigTitle').value.trim();
        var yLabel = document.getElementById('prodConfigYAxisLabel').value.trim();
        var yMin = parseInt(document.getElementById('prodConfigYAxisMin').value, 10);
        var yMax = parseInt(document.getElementById('prodConfigYAxisMax').value, 10);

        if (idx < 3) {
          prodData.graphs[idx] = {
            id: g.id,
            title: title || g.title,
            yAxisLabel: yLabel || g.yAxisLabel,
            yAxisMin: Number.isFinite(yMin) ? yMin : 0,
            yAxisMax: Number.isFinite(yMax) ? yMax : 50,
            target: to12Arr('.prod-target-input'),
            actual: to12Arr('.prod-actual-input')
          };
        } else {
          prodData.graphs[idx] = {
            id: g.id,
            title: title || g.title,
            yAxisLabel: yLabel || g.yAxisLabel,
            yAxisMin: Number.isFinite(yMin) ? yMin : 0,
            yAxisMax: Number.isFinite(yMax) ? yMax : 50,
            barYearLabel: document.getElementById('prodBarYearLabel').value.trim() || '2024-25',
            barValue: parseFloat(document.getElementById('prodBarValue').value) || 0,
            lineLabel: document.getElementById('prodLineLabel').value.trim() || 'Actual 25-26',
            line: to12Arr('.prod-line-input')
          };
        }
        localStorage.setItem('biProductionModuleData', JSON.stringify(prodData));
        if (statusEl) setStatus(statusEl, 'Graph ' + (idx + 1) + ' saved.', false);
        if (typeof window.updateProductionModule === 'function') window.updateProductionModule();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        var num = selector.value;
        if (!num) return;
        var idx = parseInt(num, 10) - 1;
        var defs = getProdDefaults();
        prodData.graphs[idx] = JSON.parse(JSON.stringify(defs.graphs[idx]));
        localStorage.setItem('biProductionModuleData', JSON.stringify(prodData));
        selector.dispatchEvent(new Event('change'));
        if (statusEl) setStatus(statusEl, 'Graph ' + (idx + 1) + ' cleared.', false);
        if (typeof window.updateProductionModule === 'function') window.updateProductionModule();
      });
    }
  }

    // Technical Module: Graphs 1–3 = bar + line, Graph 4 = capacity utilisation (bar + 3 lines)
    function setupTechnicalModule() {
      var selector = document.getElementById('techGraphSelector');
      var panel = document.getElementById('techGraphConfigPanel');
      var barLineFields = document.getElementById('techBarLineFields');
      var capFields = document.getElementById('techCapacityFields');
      var saveBtn = document.getElementById('techGraphSave');
      var clearBtn = document.getElementById('techGraphClear');
      var statusEl = document.getElementById('techStatus');
  
      if (!selector || !panel) return;
  
      var techData = { graphs: [] };
  
      function getTechDefaults() {
        return {
          graphs: [
            { id: 'tech1', title: 'Technical Graph 1 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, barYearLabel: '2024-25', barValue: 10, lineLabel: 'Actual 25-26', line: [0,0,0,0,0,0,0,0,0,0,0,0] },
            { id: 'tech2', title: 'Technical Graph 2 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, barYearLabel: '2024-25', barValue: 10, lineLabel: 'Actual 25-26', line: [0,0,0,0,0,0,0,0,0,0,0,0] },
            { id: 'tech3', title: 'Technical Graph 3 (2025-26)', yAxisLabel: 'Value', yAxisMin: 0, yAxisMax: 50, barYearLabel: '2024-25', barValue: 10, lineLabel: 'Actual 25-26', line: [0,0,0,0,0,0,0,0,0,0,0,0] },
            { id: 'tech4', title: 'Main Assy Capacity Utilisation 2025-26', yAxisLabel: 'Production / Utilisation', yAxisMin: 0, yAxisMax: 16, barLabel: 'Actual', line1Label: 'Line Capacity', line2Label: 'Series', line3Label: 'Utilization %', bar: [0,0,0,0,0,0,0,0,0,0,0,0], line1: [16,16,16,16,16,16,16,16,16,16,16,16], line2: [8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85,8.85], line3: [76,66,58,66,36,57,73,76,76,76,76,76] }
          ]
        };
      }
  
      function loadTechData() {
        try {
          var stored = JSON.parse(localStorage.getItem('biTechnicalModuleData'));
          if (stored && stored.graphs && stored.graphs.length >= 4) {
            techData = JSON.parse(JSON.stringify(stored));
            return;
          }
        } catch (e) {}
        techData = getTechDefaults();
      }
  
      function to12Arr(selector) {
        var arr = [];
        for (var i = 0; i < 12; i++) {
          var el = document.querySelector(selector + '[data-month="' + i + '"]');
          arr.push(el ? (parseFloat(el.value) || 0) : 0);
        }
        return arr;
      }
  
      function set12Arr(selector, arr) {
        var a = Array.isArray(arr) ? arr.slice(0, 12) : [];
        for (var i = 0; i < 12; i++) {
          var el = document.querySelector(selector + '[data-month="' + i + '"]');
          if (el) el.value = a[i] != null ? a[i] : 0;
        }
      }
  
      loadTechData();
  
      selector.addEventListener('change', function () {
        var num = this.value;
        if (!num) {
          panel.style.display = 'none';
          return;
        }
        var idx = parseInt(num, 10) - 1;
        var g = techData.graphs[idx];
        if (!g) return;
  
        document.getElementById('techConfigTitle').value = g.title || '';
        document.getElementById('techConfigYAxisLabel').value = g.yAxisLabel || '';
        document.getElementById('techConfigYAxisMin').value = g.yAxisMin != null ? g.yAxisMin : 0;
        document.getElementById('techConfigYAxisMax').value = g.yAxisMax != null ? g.yAxisMax : 50;
  
        if (idx < 3) {
          barLineFields.style.display = 'block';
          capFields.style.display = 'none';
          document.getElementById('techBarYearLabel').value = g.barYearLabel || '2024-25';
          document.getElementById('techBarValue').value = g.barValue != null ? g.barValue : 0;
          document.getElementById('techLineLabel').value = g.lineLabel || 'Actual 25-26';
          set12Arr('.tech-line-input', g.line);
        } else {
          barLineFields.style.display = 'none';
          capFields.style.display = 'block';
          document.getElementById('techCapBarLabel').value = g.barLabel || 'Actual';
          document.getElementById('techCapLine1Label').value = g.line1Label || 'Line Capacity';
          document.getElementById('techCapLine2Label').value = g.line2Label || 'Series';
          document.getElementById('techCapLine3Label').value = g.line3Label || 'Utilization %';
          set12Arr('.tech-cap-bar',   g.bar);
          set12Arr('.tech-cap-line1', g.line1);
          set12Arr('.tech-cap-line2', g.line2);
          set12Arr('.tech-cap-line3', g.line3);
        }
  
        panel.style.display = 'block';
      });
  
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          var num = selector.value;
          if (!num) return;
          var idx = parseInt(num, 10) - 1;
          var g = techData.graphs[idx];
          if (!g) return;
  
          var title = document.getElementById('techConfigTitle').value.trim();
          var yLabel = document.getElementById('techConfigYAxisLabel').value.trim();
          var yMin = parseInt(document.getElementById('techConfigYAxisMin').value, 10);
          var yMax = parseInt(document.getElementById('techConfigYAxisMax').value, 10);
  
          if (idx < 3) {
            techData.graphs[idx] = {
              id: g.id,
              title: title || g.title,
              yAxisLabel: yLabel || g.yAxisLabel,
              yAxisMin: Number.isFinite(yMin) ? yMin : 0,
              yAxisMax: Number.isFinite(yMax) ? yMax : 50,
              barYearLabel: document.getElementById('techBarYearLabel').value.trim() || '2024-25',
              barValue: parseFloat(document.getElementById('techBarValue').value) || 0,
              lineLabel: document.getElementById('techLineLabel').value.trim() || 'Actual 25-26',
              line: to12Arr('.tech-line-input')
            };
          } else {
            techData.graphs[idx] = {
              id: g.id,
              title: title || g.title,
              yAxisLabel: yLabel || g.yAxisLabel,
              yAxisMin: Number.isFinite(yMin) ? yMin : 0,
              yAxisMax: Number.isFinite(yMax) ? yMax : 16,
              barLabel: document.getElementById('techCapBarLabel').value.trim() || 'Actual',
              line1Label: document.getElementById('techCapLine1Label').value.trim() || 'Line Capacity',
              line2Label: document.getElementById('techCapLine2Label').value.trim() || 'Series',
              line3Label: document.getElementById('techCapLine3Label').value.trim() || 'Utilization %',
              bar:   to12Arr('.tech-cap-bar'),
              line1: to12Arr('.tech-cap-line1'),
              line2: to12Arr('.tech-cap-line2'),
              line3: to12Arr('.tech-cap-line3')
            };
          }
  
          localStorage.setItem('biTechnicalModuleData', JSON.stringify(techData));
          if (statusEl) setStatus(statusEl, 'Graph ' + (idx + 1) + ' saved.', false);
          if (typeof window.updateTechnicalModule === 'function') window.updateTechnicalModule();
        });
      }
  
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          var num = selector.value;
          if (!num) return;
          var idx = parseInt(num, 10) - 1;
          var defs = getTechDefaults();
          techData.graphs[idx] = JSON.parse(JSON.stringify(defs.graphs[idx]));
          localStorage.setItem('biTechnicalModuleData', JSON.stringify(techData));
          selector.dispatchEvent(new Event('change'));
          if (statusEl) setStatus(statusEl, 'Graph ' + (idx + 1) + ' cleared.', false);
          if (typeof window.updateTechnicalModule === 'function') window.updateTechnicalModule();
        });
      }
    }

  setupLogin();
  setupDashboard();
  setupSupplyModule();
  setupQualityModule();
  setupMaintenanceModule();
  setupProductionModule();
  setupTechnicalModule();
})();
