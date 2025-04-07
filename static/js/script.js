let isCmdPressed = false;

// ai_config.json (Placeholder for future integration)
const aiConfigSchema = {
    "type": "object",
    "properties": {
      "openai_secret_key": { "type": "string" },
      "enabled": { "type": "boolean" }
    },
    "required": ["openai_secret_key", "enabled"]
  };
  
  // Example usage in script.js
  let aiSearchConfig = {
    "openai_secret_key": "",
    "enabled": false
  };

// Global key event listeners
document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) {
        isCmdPressed = true;
        document.querySelectorAll('.link-card:hover .action-items-container').forEach(container => {
            container.classList.remove('opacity-0');
        });
    }
});

document.addEventListener('keyup', (e) => {
    if (!e.metaKey && !e.ctrlKey) {
        isCmdPressed = false;
        document.querySelectorAll('.action-items-container').forEach(container => {
            container.classList.add('opacity-0');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const selectedSort = document.getElementById('selectedSort');
    const favoritedFirstCheckbox = document.getElementById('favoritedFirst');
    const favFilterContainer = document.getElementById('favoritedFilterContainer');
    const favoritedIcon = document.getElementById('favoritedIcon');
    const favoritedText = document.getElementById('favoritedText');
    const tagsfiltersactive_bar = document.getElementById('tagsTree');
    const linksGrid = document.getElementById('linksGrid');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkModal = document.getElementById('linkModal');
    const ContainerModal = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('closeModal');
    const linkForm = document.getElementById('linkForm');
    let selectedTags = []; // Keep track of selected tags
    let tagSelected = false;
    const filtersactive_bar =   document.getElementById('activeFiltersToolbar');
    const pinnedFilterContainer = document.getElementById('pinnedFilterContainer');
    let favoritedOnly = false;
    let pinnedOnly = false;

    function debounce(func, delay) {
        let debounceTimer;
        return function() {
          const context = this;
          const args = arguments;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Form fields
    const linkIdField = document.getElementById('linkId');
    const linkNameField = document.getElementById('linkName');
    const linkUrlField = document.getElementById('linkUrl');
    const linkTagsField = document.getElementById('linkTags');
    const linkEmojisField = document.getElementById('linkEmojis');
    const colorFromField = document.getElementById('colorFrom');
    const colorToField = document.getElementById('colorTo');
    const shortDescriptionField = document.getElementById('shortDescription');
    const scoreField = document.getElementById('score');
    const pinnedField = document.getElementById('pinned');
    const favoritedField = document.getElementById('favorited');
    const saveLinkBtn = document.getElementById('saveLinkBtn');

    containerModal = document.getElementById('modal-container');

    // Sort dropdown functionality
    const sortButton = document.getElementById('sortButton');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortsSelect = document.getElementById('sortSelect');

    const linkTagsInput = document.getElementById('linkTags');
    const tagsDropdown = document.getElementById('tagsDropdown');

    const toggleButton = document.getElementById('toggleFiltersButton');
    const filtersSection = document.getElementById('filtersSection');
    const hyperlogo = document.getElementById('hyperlogo');
    const mainContainer = document.getElementById('mainContainer');

    document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
        hyperlogo.classList.toggle('justify-center');

        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('w-64')) {
            sidebar.classList.remove('w-64');
            sidebar.classList.add('w-20');
        } else {
            sidebar.classList.remove('w-20');
            sidebar.classList.add('w-64');
        }
    });

    toggleButton.addEventListener('click', function () {
        // Adjust grid columns
        if (filtersSection.classList.contains('max-h-0')) {
            mainContainer.classList.remove('md:col-span-12');
            mainContainer.classList.remove('lg:col-span-12');
            mainContainer.classList.remove('xl:col-span-12');
            mainContainer.classList.add('md:col-span-8');
            mainContainer.classList.add('lg:col-span-8');
            mainContainer.classList.add('xl:col-span-8');
            filtersSection.classList.remove('max-h-0');
            filtersSection.classList.add('max-h-[100vh]');
            filtersSection.classList.remove('collapse');
        } else {
            
            mainContainer.classList.remove('md:col-span-8');
            mainContainer.classList.remove('lg:col-span-8');
            mainContainer.classList.remove('xl:col-span-8');
            mainContainer.classList.add('md:col-span-12');
            mainContainer.classList.add('lg:col-span-12');
            mainContainer.classList.add('xl:col-span-12');
            filtersSection.classList.remove('max-h-[100vh]');
            filtersSection.classList.add('max-h-0');
            filtersSection.classList.add('collapse');
        }
    });

    // Theme logic
    function getThemePreference() {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)").matches;

        let theme = 'automatic';
        if (prefersDarkScheme) {
            theme = 'dark';
        } else if (prefersLightScheme) {
            theme = 'light';
        }

        if (theme === 'automatic') {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                theme = 'dark';
            } else {
                theme = 'light';
            }
        }

        return theme;
    }

    function sendThemeToServer(theme) {
        fetch('/set_theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme: theme })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Theme preference saved:', data.theme);
            applyTheme(data.theme);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    const theme = getThemePreference();
    sendThemeToServer(theme);

    // script.js
const activateAISearchBtn = document.getElementById('activateAISearchBtn');
const aiKeyModal = document.getElementById('aiKeyModal');
const aiSecretKeyInput = document.getElementById('aiSecretKeyInput');
const saveAISKeyBtn = document.getElementById('saveAISKeyBtn');
const closeAIKeyModal = document.getElementById('closeAIKeyModal');


activateAISearchBtn.addEventListener('click', () => {
  if (!aiSearchConfig.openai_secret_key) {
    // Prompt user for key
    aiKeyModal.classList.remove('hidden');
    aiSecretKeyInput.focus();
  } else {
    // Already enabled, transform search bar
    aiSearchConfig.enabled = !aiSearchConfig.enabled;
    applyAISearchStyling(aiSearchConfig.enabled);
  }
});

saveAISKeyBtn.addEventListener('click', () => {
  const key = aiSecretKeyInput.value.trim();
  if (key) {
    aiSearchConfig.openai_secret_key = key;
    aiSearchConfig.enabled = true;
    aiKeyModal.classList.add('hidden');
    applyAISearchStyling(true);
  }
});

closeAIKeyModal.addEventListener('click', () => {
  aiKeyModal.classList.add('hidden');
});

function applyAISearchStyling(enabled) {
  if (enabled) {
    // Change search bar to indigo-based styling
    searchInput.classList.add('border-indigo-500', 'bg-indigo-50', 'text-indigo-900', 'focus:ring-indigo-500');
  } else {
    searchInput.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-900', 'focus:ring-indigo-500');
  }
}


    // Autocomplete for tags in modal
    linkTagsInput.addEventListener('input', () => {
        const query = linkTagsInput.value.trim().split(/[,>]/).pop().trim();
        if (query.length === 0) {
            tagsDropdown.classList.add('hidden');
            return;
        }
        // Fetch existing tags from the server
        fetch(`/api/tags?search=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(tags => {
                renderTagsDropdown(tags);
            });
    });

    sortButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.classList.toggle('hidden');
    });

    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectedSort.innerHTML = `<i class="fa-regular fa-arrow-down-z-a pr-1.5"></i>`+e.target.textContent;
            sortsSelect.value = e.target.dataset.value;
            sortDropdown.classList.add('hidden');
            fetchShortcuts(); // Refresh the shortcuts based on new sort
        });
    });

    document.addEventListener('click', (e) => {
        if (!sortButton.contains(e.target) && !sortDropdown.contains(e.target)) {
            sortDropdown.classList.add('hidden');
        }
    });

    let activeTags = [];

    function fetchShortcuts(params = {}) {
        const searchParams = new URLSearchParams();

        // Add domain parameter if provided
        if (params.domain) {
            searchParams.append('domain', params.domain);
        }

        // Search input
        if (searchInput.value) {
            searchParams.append('search', searchInput.value);
        }

        // Sort selection
        if (sortSelect.value) {
            searchParams.append('sort_by', sortSelect.value);
        }

        // Favorited/pinned filters
        if (favoritedOnly) {
            searchParams.append('favorited_only', 'true');
        }
        if (pinnedOnly) {
            searchParams.append('pinned_only', 'true');
        }

        if(currentDomains.length > 0){
            currentDomains.forEach(d => {
                searchParams.append('domain', d);
              });
        }
        // Selected tags
        if (selectedTags.length > 0) {
            selectedTags.forEach(tagId => {
                searchParams.append('tags', tagId);
            });
        }

        return fetch(`/api/shortcuts?${searchParams.toString()}`)
        .then(response => response.json())
        .then(shortcuts => {
          displayShortcuts(shortcuts);
          applyPinnedAndFavoriteStyling();
          updateFilterStyles();
          updateLinkCounts(shortcuts.length);
          // If you have a separate endpoint or data for total clicks:
          fetchTotalClicks().then(clicks => {
            document.getElementById('linkCountTotal').textContent = clicks;
            document.getElementById('linkCountTotal').parentElement.classList.remove(
                'skeleton-loading',
            );
          });
          return shortcuts;
        })
        .catch(error => {
          console.error('Error fetching shortcuts:', error);
        });
    }

    // After shortcuts are displayed:
function applyPinnedAndFavoriteStyling() {
    // If favoritedOnly or pinnedOnly is active, fade out non-matching cards.
    document.querySelectorAll('#linksGrid article').forEach(article => {
      const shortcutId = article.getAttribute('data-id');
    //   const shortcut = shortcuts.find(s => s.id === shortcutId);
      if (favoritedOnly && article.querySelector('.fa-solid.fa-heart') == null) {
        article.style.opacity = '0.1';
      } else if (pinnedOnly && article.querySelector('.fa-solid.fa-bookmark') === null) {
        article.style.opacity = '0.1';
      } else {
        article.style.opacity = '1';
      }
    });
  }
  
    function updateLinkCounts(count) {
     
      
        const linkCountElementReal = document.getElementById('linkCountTotal');
        if (linkCountElementReal) {
          linkCountElementReal.innerHTML = `${count}`;
        }
      }
      
      function fetchTotalClicks() {
        // If you have an endpoint `/api/stats` returning { total_clicks: number }:
        return fetch('/api/stats')
          .then(res => res.json())
          .then(data => data.total_clicks)
          .catch(() => 0);
      }

  
    document.querySelectorAll('.domain-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            const domain = filter.getAttribute('data-domain');
            if(!currentDomains.includes(domain))
                {setDomainFilter(domain);}
            else {removeDomainFilter(domain);}
            // fetchShortcuts();
        });
    });

    function srenderTags(tagsData) {
        tagsfiltersactive_bar.innerHTML = '';
        const tagList = document.createElement('ul');
        tagList.classList.add('tag-tree');
        tagList.classList.add('max-h-unset', 'overflow-hidden');
        renderTagTree(tagsData, tagList);
        tagsfiltersactive_bar.appendChild(tagList);
    }

    // Debounce search input
    searchInput.addEventListener('input', debounce(() => {
        fetchShortcuts();
    }, 300));

    sortSelect.addEventListener('change', () => {
        fetchShortcuts();
    });

    // if (favoritedFirstCheckbox) {
    //     favoritedFirstCheckbox.addEventListener('change', () => {
    //         fetchShortcuts();
    //     });
    // }



    closeModalBtn.addEventListener('click', () => {
        linkForm.reset();
        closeModal();
    });

    function displayShortcuts(shortcuts) {
        // Clear the grid with a fade-out effect
        linksGrid.querySelectorAll('article').forEach(article => {
            article.classList.add('opacity-0');
            setTimeout(() => {
                article.remove();
            }, 200);
        });
        linksGrid.innerHTML = '';
  
        if (shortcuts.length === 0) {
          const isFilterActive = !!(searchInput.value || pinnedOnly || favoritedOnly || selectedTags.length > 0 || !allDomainsActive);
          const message = document.createElement('div');
          message.className = 'text-center text-gray-500 dark:text-gray-400 w-full mt-10';
          if (isFilterActive) {
            message.textContent = "No shortcuts found. Try removing some filters.";
          } else {
            message.textContent = "You have no shortcuts yet. Add some using the 'Add New Link' button!";
          }
          linksGrid.appendChild(message);
          return;
        }

        setTimeout(() => {
            shortcuts.forEach(shortcut => {
                // Rest of the card rendering code unchanged from your original
                // except the favicon route corrected below

                const article = document.createElement('article');
                article.className = 'transition duration-200 opacity-0 link-card';
                article.setAttribute('data-id', shortcut.id);

                const averageLuminance = calculateAverageLuminance(shortcut.color_from, shortcut.color_to);
                const textColor = 'text-white';
                const overlayStrength = averageLuminance > 0.5 ? 'luminanceneg' : 'luminancepos';

                const linkCard = document.createElement('a');
                linkCard.href = shortcut.link;
                linkCard.target = '_blank';
                linkCard.setAttribute('aria-label', 'Visit ' + shortcut.name);
                linkCard.className = `link-card ${overlayStrength} relative h-48 z-0 mx-auto flex flex-col items-center justify-center bg-gradient-to-br p-4 filter overflow-hidden transition duration-200 h-40 rounded-lg`;
                linkCard.style.backgroundImage = `linear-gradient(to bottom right, ${shortcut.color_from}, ${shortcut.color_to})`;

                const gradientOverlay = document.createElement('div');
                if (averageLuminance < 0.1) {
                    gradientOverlay.className = 'absolute left-0 top-0 h-full w-full dark:highlight-white bg-gradient-to-br from-white/20 to-white/10';
                } else if (averageLuminance < 0.3) {
                    gradientOverlay.className = 'absolute left-0 top-0 h-full w-full dark:highlight-white bg-gradient-to-br from-white/10 to-black/10';
                } else if (averageLuminance < 0.6) {
                    gradientOverlay.className = 'absolute left-0 top-0 h-full w-full dark:highlight-white bg-gradient-to-br from-transparent to-black/10';
                } else if (averageLuminance < 0.9) {
                    gradientOverlay.className = 'absolute left-0 top-0 h-full w-full dark:highlight-white bg-gradient-to-br from-black/5 to-black/20';
                } else {
                    gradientOverlay.className = 'absolute left-0 top-0 h-full w-full bg-gradient-to-b from-black/50 to-black/40';
                }

                linkCard.appendChild(gradientOverlay);

                const statusBadgeContainer = document.createElement('div');
                statusBadgeContainer.className = 'absolute hidden opacity-0 flex flex-wrap content-start gap-1 overflow-hidden top-3 text-xs transition-opacity duration-200';
                const statusBadge = document.createElement('div');
                statusBadge.className = `inline-flex cursor-pointer select-none items-center overflow-hidden font-mono rounded bg-white/30 leading-tight p-1 text-white opacity-100`;

                const tags = shortcut.tags || [];
                const tagStrings = tags.map(tag => {
                    const parts = tag.split('>').map(t => t.trim());
                    let result = parts.join(' > ');
                    return result;
                });

                if (tags.length !== 0) {
                    tagStrings.forEach((tag, idx) => {
                        const tagSpan = document.createElement('span');
                        tagSpan.className = 'inline-flex items-center px-1 py-0';
                        tagSpan.textContent = tag;
                        statusBadge.appendChild(tagSpan);

                        if (idx < tagStrings.length - 1) {
                            const separator = document.createElement('span');
                            separator.className = 'px-0.5';
                            separator.textContent = '•';
                            statusBadge.appendChild(separator);
                        }
                    });
                    statusBadgeContainer.appendChild(statusBadge);
                    linkCard.appendChild(statusBadgeContainer);
                }

                const iconContainer = document.createElement('div');
                iconContainer.className = 'absolute hidden opacity-0 flex px-1 items-center rounded-xl top-2.5 right-4 text-xs cursor-pointer select-none items-center overflow-hidden font-mono rounded bg-white/20 text-white transition-opacity duration-200';

                if (shortcut.score) {
                    const starIcon = document.createElement('i');
                    starIcon.className = 'fa fa-xs fa-star text-white mr-1';
                    iconContainer.appendChild(starIcon);

                    const scoreSpan = document.createElement('span');
                    scoreSpan.className = 'text-white font-bold text-xs';
                    scoreSpan.textContent = shortcut.score;
                    iconContainer.appendChild(scoreSpan);
                    linkCard.appendChild(iconContainer);
                }

                const emojiContainer = document.createElement('div');
                emojiContainer.className = 'absolute text-center flex items-center justify-center -mt-1 opacity-50 transition-opacity duration-200';
                emojiContainer.style.height = '60px';
                emojiContainer.style.width = '-webkit-fill-available';

                const blurredEmoji = document.createElement('div');
                blurredEmoji.className = 'emoji inline absolute opacity-100 blur-100 text-6xl mb-1 transition-transform duration-200';
                blurredEmoji.style.mixBlendMode = 'normal';
                blurredEmoji.style.filter = 'blur(35px)';
                blurredEmoji.textContent = shortcut.emojis || '🔗';

                const emojiSpan = document.createElement('div');
                emojiSpan.className = 'emoji inline absolute text-7xl mb-1 transition-transform duration-200';
                emojiSpan.textContent = shortcut.emojis || '🔗';

                emojiContainer.appendChild(blurredEmoji);
                emojiContainer.appendChild(emojiSpan);
                linkCard.appendChild(emojiContainer);

                const nameDiv = document.createElement('h4');
                nameDiv.className = `card-title z-40 overflow-visible p-5 py-8 max-w-full truncate text-center font-bold ${textColor} text-2xl transition-transform duration-200`;
                nameDiv.style.textShadow = '0px 3px 40px rgba(0, 0, 0, 0.8)';
                nameDiv.textContent = shortcut.name;
                linkCard.appendChild(nameDiv);

                if (shortcut.short_description) {
                    const descriptionDiv = document.createElement('div');
                    const descriptionText = document.createElement('p');
                    const descriptionSpan = document.createElement('span');
                    const svgDecor = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="pointer-events-none absolute left-0 h-full -translate-x-full text-black/15" viewBox="0 0 16 12"><path fill="currentColor" d="M9.49 6.13C8.07 10.7 6.09 12 0 12h16V0c-3.5 0-4.97 1.2-6.51 6.13Z"></path></svg>`;

                    descriptionDiv.innerHTML = svgDecor;
                    descriptionText.className = 'bg-black/15 transition duration-200 leading-tight';
                    descriptionSpan.className = 'truncate break-words py-0.5 text-white/80 pr-2 text-[0.78rem] -ml-1 transition-opacity duration-200';
                    descriptionSpan.textContent = shortcut.short_description;
                    descriptionText.appendChild(descriptionSpan);
                    descriptionDiv.appendChild(descriptionText);

                    descriptionDiv.className = 'absolute bottom-0 right-0 z-40 flex max-w-[83%] items-center';
                    linkCard.appendChild(descriptionDiv);
                }

                const iconsContainer = document.createElement('span');
                iconsContainer.classList.add('shortcut-icons-container', 'gap-2', 'absolute', 'top-2', 'left-2', 'transition-opacity', 'text-lg', 'duration-200');
    
                const iconsContainerFlex = document.createElement('div');
                iconsContainerFlex.classList.add('flex', 'gap-2', 'transition-opacity', 'duration-200');
    
                // pinned icon
                const pinnedIcon = document.createElement('i');
                pinnedIcon.className = shortcut.pinned ? 'fa fa-solid fa-bookmark text-white cursor-pointer ' : 'fa fa-regular hidden fa-bookmark text-white cursor-pointer  opacity-0';
                iconsContainerFlex.appendChild(pinnedIcon);
    
                // favorited icon
                const favoritedIconEl = document.createElement('i');
                favoritedIconEl.className = shortcut.favorited ? 'fa fa-solid fa-heart text-white cursor-pointer ' : 'fa fa-regular hidden fa-heart text-white cursor-pointer  opacity-0';
                iconsContainerFlex.appendChild(favoritedIconEl);
    
                iconsContainer.appendChild(iconsContainerFlex);
                linkCard.appendChild(iconsContainer);
    
            

                const ActionIconsWR = document.createElement('span');
                const trashIcon = document.createElement('i');
                const editIcon = document.createElement('i');
                ActionIconsWR.classList.add('action-items-container', 'absolute', 'bottom-2', 'left-2', 'opacity-0', 'transition-opacity', 'text-lg', 'duration-200');
                trashIcon.className = 'trash-icon fa fa-solid drop-shadow-md fa-trash text-white/80 cursor-pointer hover:text-white transition-opacity duration-200';
                editIcon.className = 'ml-2 edit-icon fa fa-solid drop-shadow-md fa-pencil text-white/80 cursor-pointer hover:text-white transition-opacity duration-200';

                ActionIconsWR.appendChild(trashIcon);
                ActionIconsWR.appendChild(editIcon);

                linkCard.appendChild(iconsContainer);
                linkCard.appendChild(ActionIconsWR);
                if (favoritedOnly) {
                       
                    favoritedIconEl.classList.remove('opacity-0');
                }
                if (pinnedOnly) {
                    pinnedIcon.classList.remove('opacity-0');
                }

                linkCard.addEventListener('mouseenter', () => {
                    if (isCmdPressed) {
                        ActionIconsWR.classList.remove('opacity-0');
                    }
                    statusBadgeContainer.classList.remove('hidden');
                    iconContainer.classList.remove('hidden');
                    iconContainer.classList.remove('opacity-0');
                    statusBadgeContainer.classList.remove('opacity-0');
                    const descriptionSpan = linkCard.querySelector('.truncate.break-words');
                    if (descriptionSpan) {
                        descriptionSpan.classList.remove('text-white/80');
                        descriptionSpan.classList.add('text-white');
                    }

                    iconContainer.classList.add('opacity-80');
                    statusBadgeContainer.classList.add('opacity-100');
                    emojiContainer.classList.add('opacity-100');
                    emojiSpan.classList.remove('opacity-40');
                    emojiSpan.classList.add('opacity-100');
                    favoritedIconEl.classList.remove('hidden');
                    pinnedIcon.classList.remove('hidden');
                    setTimeout(() => {
                        pinnedIcon.classList.remove('opacity-0');
                        favoritedIconEl.classList.remove('opacity-0');
                    }, 200);
                  
                });

                linkCard.addEventListener('mouseleave', () => {
                    ActionIconsWR.classList.add('opacity-0');
                    iconContainer.classList.add('opacity-0');
                    statusBadgeContainer.classList.add('opacity-0');
                    iconContainer.classList.remove('opacity-80');
                    statusBadgeContainer.classList.remove('opacity-100');
                    const descriptionSpan = linkCard.querySelector('.truncate.break-words');
                    if (descriptionSpan) {
                        descriptionSpan.classList.add('text-white/80');
                        descriptionSpan.classList.remove('text-white');
                    }
                    emojiContainer.classList.remove('opacity-100');
                    if (!favoritedOnly) {
                        if (!shortcut.favorited) favoritedIconEl.classList.add('opacity-0');
                    }
                    if (!pinnedOnly) {
                        if (!shortcut.pinned) pinnedIcon.classList.add('opacity-0');
                    }
                    setTimeout(() => {
                        statusBadgeContainer.classList.add('hidden');
                        iconContainer.classList.add('hidden');
                        if (!shortcut.favorited)favoritedIconEl.classList.add('hidden');
                        if (!shortcut.pinned)pinnedIcon.classList.add('hidden');
                    }, 200);
                });

                trashIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this shortcut?')) {
                        deleteShortcut(shortcut.id);
                    }
                });

                editIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm('Do you want to edit this shortcut?')) {
                        openModal(shortcut);
                    }
                });

                iconsContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = e.target;

                    if (target.classList.contains('fa-heart')) {
                        if (confirm('Do you want to change the favorite status of this shortcut?')) {
                            fetch(`/api/shortcuts/${shortcut.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    ...shortcut,
                                    favorited: !shortcut.favorited
                                })
                            }).then(() => fetchShortcuts());
                        }
                    }

                    if (target.classList.contains('fa-bookmark')) {
                        if (confirm('Do you want to change the pinned status of this shortcut?')) {
                            fetch(`/api/shortcuts/${shortcut.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    ...shortcut,
                                    pinned: !shortcut.pinned
                                })
                            }).then(() => fetchShortcuts());
                        }
                    }
                });

                linkCard.addEventListener('click', (event) => {
                    event.preventDefault(); 
                    if (event.target.closest('.action-items-container')) return;
                    if (event.target.closest('.shortcut-icons-container')) return;
                    const emojis = linkCard.querySelectorAll('.emoji')[0].innerHTML;
                    const splitEmoji = (string) => [...new Intl.Segmenter().segment(string)].map(x => x.segment);
                    const count = 8;
                    for (let i = 0; i < count; i++) {
                        const x = event.pageX;
                        const y = event.pageY;
                        createEmoji(x, y, splitEmoji(emojis));
                    }
                    setTimeout(() => {
                        window.open(shortcut.link, '_blank');
                    }, 500);
                });

                article.appendChild(linkCard);

                const footer = document.createElement('header');
                footer.className = 'mt-0 flex items-center overflow-hidden';

                const domain = extractDomain(shortcut.link);

                const domainLi = document.createElement('li');
                domainLi.className = 'group relative flex items-center whitespace-nowrap';
                const domainSpan = document.createElement('span');
                domainSpan.className = 'flex items-center gap-1 text-slate-900 dark:text-blue-50 text-xs font-mono mt-1';
                const favIconWrapper = document.createElement('span');
                favIconWrapper.className = 'rounded m-1';

                const faviconImg = document.createElement('img');
                faviconImg.classList.add(
                    'w-5',
                    'h-5',
                    'p-0.5',
                    'bg-gray-300',
                    'dark:bg-gray-700',
                    'rounded',
                    'skeleton-loading',
                );
                faviconImg.src = `/static/favicons/${domain}.png`;
                faviconImg.onload = () => {
                    faviconImg.classList.remove(
                        'bg-gray-300',
                        'dark:bg-gray-700',
                        'skeleton-loading',
                    );
                };
                faviconImg.onerror = () => {
                    faviconImg.src = '/static/default/favicon.png';
                    faviconImg.classList.add(
                        'bg-gray-300',
                        'dark:bg-gray-700',
                        'skeleton-loading',
                    );
                };

                const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const currentTheme = isDarkMode ? 'dark' : 'light';
                faviconImg.src = `/favicons/get_favicon?domain=${encodeURIComponent(domain)}&theme=${currentTheme}`;

                const domainText = document.createElement('span');
                domainText.textContent = domain;

                favIconWrapper.appendChild(faviconImg);
                domainSpan.appendChild(favIconWrapper);
                domainSpan.appendChild(domainText);
                domainLi.appendChild(domainSpan);
                footer.appendChild(domainLi);
                article.appendChild(footer);

                linksGrid.appendChild(article);
                void article.offsetWidth;
                article.classList.remove('opacity-0');
            });

           
        }, 200);
        applyPinnedAndFavoriteStyling();
    }

    function extractDomain(url) {
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace('www.', '');
        } catch (e) {
            return url;
        }
    }

    function createEmoji(x, y, emojiArray) {
        const gravity = 0;
        const friction = 0.99;

        for (let i = 0; i < 3; i++) {
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = '0px';
            ripple.style.height = '0px';
            ripple.style.opacity = '0';
            ripple.style.border = '2px solid rgba(255,255,255,'+0.05*(i/3)+')';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.animation = `ripple 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`;
            document.body.appendChild(ripple);

            ripple.style.width = '50px';
            ripple.style.height = '50px';

            setTimeout(() => ripple.remove(), 500 + (i * 100));
        }

        for (let i = 0; i < emojiArray.length; i++) {
            setTimeout(() => {
                const emojiElement = document.createElement('span');
                emojiElement.innerText = emojiArray[i];
                emojiElement.style.position = 'absolute';
                emojiElement.style.fontSize = '48px';
                emojiElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                emojiElement.style.pointerEvents = 'none';
                document.body.appendChild(emojiElement);

                let scale = Math.random() * 0.7 + 0.3;
                let rotation = Math.random() * 360;
                let opacity = 1;
                let velX = (Math.random() - 0.5) * 40;
                let velY = (Math.random() - 0.5) * 40;

                function update() {
                    velY += gravity;
                    velX *= friction;
                    velY *= friction;
                    x += velX;
                    y += velY;
                    scale -= 0.03;
                    rotation += 5;
                    opacity -= 0.03;
                    emojiElement.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`;
                    emojiElement.style.opacity = opacity;
                    if (opacity > 0) {
                        requestAnimationFrame(update);
                    } else {
                        emojiElement.remove();
                    }
                }
                update();
            }, i * 10);
        }

        if (!document.querySelector('#rippleAnimation')) {
            const style = document.createElement('style');
            style.id = 'rippleAnimation';
            style.textContent = `
                @keyframes ripple {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 0;
                    }
                    5% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(3);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    let tagParentMap = {}; // global map: tagId -> parentId

    function fetchTags() {
      return fetch('/api/tags')
        .then(response => response.json())
        .then(data => {
          srenderTags(data);
          buildTagParentMap(data);
          updateFilterStyles(); // Apply styling after tags load
        })
        .catch(error => { console.error('Error fetching tags:', error); });
    }
    function buildTagParentMap(tags, parentId = null) {
        tags.forEach(tag => {
          tagParentMap[tag.id] = parentId; // This tag's parent is parentId
          if (tag.children && tag.children.length > 0) {
            buildTagParentMap(tag.children, tag.id);
          }
        });
      }
      function buildTagsTree(tags, parentTagId) {
        const ul = document.createElement('ul');
      
        tags.forEach(tag => {
          const li = document.createElement('li');
          const tagLink = document.createElement('a');
          tagLink.textContent = `${tag.name} (${tag.count})`;
          tagLink.classList.add('tag-link');
          tagLink.href = '#';
          tagLink.setAttribute('data-tag-id', tag.id); // Ensure tag ID is correctly set
      
          tagLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleTagClick(tagLink); // Use the click handler
          });
      
          li.appendChild(tagLink);
      
          if (tag.children && tag.children.length > 0) {
            const childUl = buildTagsTree(tag.children, tag.id);
            li.appendChild(childUl);
          }
      
          ul.appendChild(li);
        });
      
        return ul;
      }
    function renderTagTree(tags, container, level = 0) {
        tags.forEach((tag, index) => {
            const isLast = index === tags.length - 1;
            const isParent = level == 0;
            const hasChildrenTree = tag.children && tag.children.length > 0;

            const tagItemWrap = document.createElement('div');
            tagItemWrap.className = 'flex h-[28px] transition duration-300 w-full items-center justify-between gap-2 tag-link overflow-hidden';

            tagItemWrap.setAttribute('data-tag-id', tag.id);
            if(!isParent){
                tagItemWrap.classList.add('-mt-1');
            }
            const iconContainer = document.createElement('div');
            iconContainer.className = 'relative h-[28px] w-[19px] flex-none ';
            iconContainer.style.marginLeft = `${level * 20}px`;

            let leftLine = document.createElement('div');
            leftLine.className = 'left absolute inset-y-0 -top-[3px] left-0 w-px bg-gray-300 dark:bg-gray-600';

            let leftLineParent = document.createElement('div');
            leftLineParent.className = 'left relative  h-[28px] inset-y-0 -top-[3px] left-0 w-px bg-gray-300 dark:bg-gray-600';

            
            if (isLast) {
                leftLine.style.bottom = '28px';
            } else if (level != 0){
                    tagItemWrap.appendChild(leftLineParent);
            }
            iconContainer.appendChild(leftLine);

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'text-gray-300 dark:text-gray-600');
            svg.setAttribute('width', '19');
            svg.setAttribute('height', '28');
            svg.setAttribute('viewBox', '0 0 19 28');
            svg.innerHTML = '<path fill-rule="evenodd" clip-rule="evenodd" d="M1 0C1 7.42391 7.4588 13.5 15.5 13.5V14.5C6.9726 14.5 0 8.04006 0 0H1Z" fill="currentColor"></path>';
            iconContainer.appendChild(svg);

            let iconExpandContainer = document.createElement('div');
            let iconExpand = document.createElement('i');
            if(hasChildrenTree){
                
            iconExpand.className = 'fa fa-solid fa-caret-down text-gray-300 dark:text-gray-300';
            }
            else{

            iconExpand.className = 'fa fa-solid fa-2xs fa-circle-small text-gray-300 dark:text-gray-400';
            }
            iconExpand.style.marginLeft = '-11px';
            iconExpand.style.marginTop = '3px';
            tagItemWrap.appendChild(iconContainer);
            
            iconExpandContainer.appendChild(iconExpand);
            tagItemWrap.appendChild(iconExpandContainer);

            const tagName = document.createElement('div');
            tagName.className = 'font-medium text-gray-700 dark:text-gray-400 text-sm';
            tagName.textContent = tag.name;
            tagName.setAttribute('data-tag-id', tag.id);
            tagItemWrap.appendChild(tagName);

            const separatorLine = document.createElement('div');
            separatorLine.className = 'mx-3 flex-1 translate-y-[2.5px] self-center border-b border-dotted dark:border-gray-800';
            tagItemWrap.appendChild(separatorLine);

            const tagLink = document.createElement('a');
            tagLink.className = 'text-gray-700 rounded text-xs bg-indigo/10 dark:bg-white/5 font-semibold px-1 py-0.5 text-center decoration-gray-300 hover:text-gray-900 hover:decoration-gray-600 dark:text-gray-400/70 dark:decoration-gray-500 dark:hover:text-gray-100 dark:hover:decoration-gray-200';
            tagLink.href = `#`;
            tagLink.innerHTML = `${tag.count} <i class="fa fa-xs fa-link"></i>`;

            tagItemWrap.addEventListener('click', (e) => {
                e.preventDefault();
                const tagId = tag.id;
                if (tagId) {
                    handleTagClick((tagItemWrap));
                    tagName.classList.toggle('selected');
                }
            });
            // tagLink.addEventListener('click', (e) => {
            //     e.preventDefault();
            //     const tagId = tag.id;
            //     if (tagId) {
            //         handleTagSelection(parseInt(tagId));
            //         tagLink.classList.toggle('selected');
            //     }
            // });

            tagItemWrap.appendChild(tagLink);

            container.appendChild(tagItemWrap);

            if (hasChildrenTree) {
                renderTagTree(tag.children, container, level + 1);
            }
        });
    }

    function renderTagsDropdown(tags) {
        tagsDropdown.innerHTML = '';
        if (tags.length === 0) {
            tagsDropdown.classList.add('hidden');
            return;
        }
        tags.forEach(tag => {
            const tagOption = document.createElement('div');
            tagOption.className = 'px-4 py-2 cursor-pointer hover:bg-gray-100';
            tagOption.textContent = tag.name;
            tagOption.addEventListener('click', () => {
                let currentTags = linkTagsInput.value.split(/[,>]/).map(t => t.trim());
                currentTags[currentTags.length - 1] = tag.name;
                linkTagsInput.value = currentTags.join(', ');
                tagsDropdown.classList.add('hidden');
                linkTagsInput.focus();
            });
            tagsDropdown.appendChild(tagOption);
        });
        tagsDropdown.classList.remove('hidden');
    }

    window.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey) {
            isCmdPressed = true;
            document.querySelectorAll('.link-card:hover .action-items-container').forEach(icon => {
                icon.classList.remove('opacity-0');
            });
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!e.metaKey && !e.ctrlKey) {
            isCmdPressed = false;
            document.querySelectorAll('.action-items-container').forEach(icon => {
                icon.classList.add('opacity-0');
            });
        }
    });

    favFilterContainer.addEventListener('click', (e) => {
        e.preventDefault();
        favoritedOnly = !favoritedOnly;
        const icon = favFilterContainer.querySelector('i');
      
        if (favoritedOnly) {
          // Active state: use a distinct accent color
          favFilterContainer.classList.add('bg-indigo-500/20');
          icon.classList.remove('fa-regular');
          icon.classList.add('fa-solid', 'text-red-400');
        } else {
          // Inactive state
          favFilterContainer.classList.remove('bg-indigo-500/20');
          icon.classList.remove('fa-solid', 'text-red-400');
          icon.classList.add('fa-regular');
        }
      
        fetchShortcuts().then(() => {
            applyPinnedAndFavoriteStyling();
          });
      });
      

      pinnedFilterContainer.addEventListener('click', (e) => {
        e.preventDefault();
        pinnedOnly = !pinnedOnly;
        const icon = pinnedFilterContainer.querySelector('i');
      
        if (pinnedOnly) {
          pinnedFilterContainer.classList.add('bg-indigo-500/20');
          icon.classList.remove('fa-regular');
          icon.classList.add('fa-solid', 'text-amber-400');
        } else {
          pinnedFilterContainer.classList.remove('bg-indigo-500/20');
          icon.classList.remove('fa-solid', 'text-amber-400');
          icon.classList.add('fa-regular');
        }
      
        fetchShortcuts().then(() => {
            applyPinnedAndFavoriteStyling();
          });
      });

    addLinkBtn.addEventListener('click', () => openModal());

    window.addEventListener('click', (event) => {
        if (event.target === ContainerModal) {
            closeModal();
        }
    });

    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const shortcutData = {
            id: linkIdField.value,
            name: linkNameField.value,
            link: linkUrlField.value,
            tags: linkTagsField.value.split(',').map(tag => tag.trim()),
            emojis: linkEmojisField.value,
            color_from: colorFromField.value,
            color_to: colorToField.value,
            short_description: shortDescriptionField.value,
            score: parseFloat(scoreField.value) || 0,
            pinned: pinnedField.checked,
            favorited: favoritedField.checked
        };

        const method = shortcutData.id ? 'PUT' : 'POST';
        const url = shortcutData.id ? `/api/shortcuts/${shortcutData.id}` : '/api/shortcuts';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(shortcutData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            closeModal();
            fetchShortcuts();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving shortcut: ' + error.message);
        });
    });

    function deleteShortcut(id) {
        if (confirm('Are you sure you want to delete this link shortcut?')) {
            fetch(`/api/shortcuts/${id}`, {
                method: 'DELETE',
            })
                .then(response => response.json())
                .then(data => {
                    fetchShortcuts();
                })
                .catch(error => {
                    console.error('Error deleting shortcut:', error);
                });
        }
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return {r, g, b};
    }

    function getLuminance(r, g, b) {
        let R = r/255;
        let G = g/255;
        let B = b/255;

        R = R <= 0.03928 ? R/12.92 : ((R+0.055)/1.055)**2.4;
        G = G <= 0.03928 ? G/12.92 : ((G+0.055)/1.055)**2.4;
        B = B <= 0.03928 ? B/12.92 : ((B+0.055)/1.055)**2.4;

        return 0.2126*R + 0.7152*G + 0.0722*B;
    }

    function calculateAverageLuminance(color1Hex, color2Hex) {
        const c1 = hexToRgb(color1Hex);
        const c2 = hexToRgb(color2Hex);

        const avgR = (c1.r + c2.r) / 2;
        const avgG = (c1.g + c2.g) / 2;
        const avgB = (c1.b + c2.b) / 2;

        return getLuminance(avgR, avgG, avgB);
    }
    let currentDomains = [];
let allDomainsActive = true; // If no domain filters are active


// Add an "All Domains" chip if needed:
if (allDomainsActive) {
  const chip = createFilterChip('All Domains', () => {
    // This would do nothing or toggle to show all domains, since it's already all.
  });
  filtersactive_bar.appendChild(chip);
}

function updateFilterStyles() {
    // Domain filters styling
    const domainElements = document.querySelectorAll('.domain-filter');
    if (allDomainsActive) {
        // No domain filters: all should have full opacity and no inactive classes
        domainElements.forEach(el => {
          el.classList.remove('opacity-20', 'hover:opacity-70');
          // Add default styling classes as needed
        });
      } else {
    domainElements.forEach(el => {
      const domain = el.getAttribute('data-domain');
      if (currentDomains.includes(domain)) {
        // Active
        el.classList.remove('opacity-20', 'hover:opacity-70');
        el.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
      } else {
        // Inactive
        el.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
        el.classList.add('opacity-20', 'hover:opacity-70');
      }
    });
    }
    // Tag filters styling:
    const allTagLinks = document.querySelectorAll('#tagsTree .tag-link');

    allTagLinks.forEach(link => {
      const tagId = parseInt(link.getAttribute('data-tag-id'));
      if (selectedTags.includes(tagId)) {
        // Tag is selected
        link.classList.add('text-white','opacity-100');
        link.classList.remove('opacity-20', 'hover:opacity-70', 'max-h-0');
      } else {
        // Tag is not selected
        link.classList.remove('text-white','opacity-100','max-h-0');
        if(tagSelected)
            {
                link.classList.add('opacity-20', 'hover:opacity-70');}
        if(tagSelected && selectedTags.length > 0){
            link.classList.add('max-h-0');
        }
      }
    });
    
  }
  
  // A helper function to get visible tag IDs for the selected tags:
  function getVisibleTagIdsForSelection(selectedTagIds) {
    // Assuming we have a data structure with tag hierarchies available or stored after fetch.
    // If not available, we must store tags in a global variable after fetch.
    // For now, pseudo-code:
    const visibleIds = [];
    selectedTagIds.forEach(id => {
      // Add the selected tag
      visibleIds.push(id);
      // Add its parents (if we maintain a parent mapping)
      let parentId = tagParentMap[id];
      while (parentId) {
        visibleIds.push(parentId);
        parentId = tagParentMap[parentId];
      }
    });
    return visibleIds;
  }

  function handleTagSelection(tagId) {
    const index = selectedTags.indexOf(tagId);
    if (index > -1) {
      selectedTags.splice(index, 1);
    } else {
      selectedTags.push(tagId);
    }
    fetchShortcuts().then(() => {
      updateFilterStyles();
    });
  }
  // Add this function to handle tag clicks
function handleTagClick(tagElement) {
    const tagId = parseInt(tagElement.getAttribute('data-tag-id'));
    const tagIndex = selectedTags.indexOf(tagId);
    tagSelected = true;
    if (tagIndex > -1) {
      // Tag is already selected; remove it
      selectedTags.splice(tagIndex, 1);
    } else {
      // Tag is not selected; add it
      selectedTags.push(tagId);
    }
  
    // updateFilterChips(); // Update the UI to reflect active filters
    updateFilterStyles(); // Update styles based on current selections
    fetchShortcuts();     // Fetch and display shortcuts matching the filters
  }
  
  function setDomainFilter(domain) {
    if (!currentDomains.includes(domain)) {
      currentDomains.push(domain);
      allDomainsActive = false;
      fetchShortcuts({domain: currentDomains}).then(() => {
        updateFilterStyles();
      });
    }
  }
  
  function removeDomainFilter(domain) {
    const idx = currentDomains.indexOf(domain);
    if (idx > -1) {
      currentDomains.splice(idx, 1);
    }
    if (currentDomains.length === 0) {
      allDomainsActive = true;
    }
    fetchShortcuts().then(() => {
      updateFilterStyles();
    });
  }
  
      
      function createFilterChip(label, removeCallback) {
        const chip = document.createElement('div');
        chip.className = 'flex items-center bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full text-sm';
        chip.textContent = label;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'ml-2 text-indigo-900 hover:text-indigo-700';
        removeBtn.innerHTML = '&times;';
        removeBtn.setAttribute('aria-label', 'Remove filter ' + label);
        removeBtn.addEventListener('click', removeCallback);
        
        chip.appendChild(removeBtn);
        return chip;
      }

    function openModal(shortcut = null) {
        if (shortcut) {
            linkIdField.value = shortcut.id;
            linkNameField.value = shortcut.name;
            linkUrlField.value = shortcut.link;
            linkTagsField.value = shortcut.tags.join(', ');
            linkEmojisField.value = shortcut.emojis;
            colorFromField.value = shortcut.color_from;
            colorToField.value = shortcut.color_to;
            shortDescriptionField.value = shortcut.short_description;
            scoreField.value = shortcut.score;
            pinnedField.checked = shortcut.pinned;
            favoritedField.checked = shortcut.favorited;
        } else {
            linkForm.reset();
            linkIdField.value = '';
        }
        containerModal.classList.remove('hidden');
    }

    function closeModal() {
        linkForm.reset();
        linkIdField.value = '';
        containerModal.classList.add('hidden');
    }

    const autofillBtn = document.getElementById('autofill-button');
    // autofillBtn.type = 'button';
    // autofillBtn.textContent = 'Autofill';
    // autofillBtn.classList.add('absolute', 'right-2', 'top-[2.5rem]', 'text-sm', 'bg-gray-200', 'dark:bg-gray-700', 'px-2', 'py-1', 'rounded', 'hover:bg-gray-300', 'dark:hover:bg-gray-600');
    // linkUrlField.parentElement.style.position = 'relative';
    // linkUrlField.parentElement.appendChild(autofillBtn);

    autofillBtn.addEventListener('click', () => {
        let autofillIcon = autofillBtn.querySelector('i');
        autofillIcon.classList.add('animate-spin');
        const url = linkUrlField.value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            alert('Please enter a valid URL including http:// or https://');
            autofillIcon.classList.remove('animate-spin');

            return;
        }
        fetch(`/api/autofill?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert('Autofill failed: ' + data.error);
                autofillIcon.classList.remove('animate-spin');  
                return;
            }
            linkNameField.value = data.name || '';
            linkEmojisField.value = data.emoji || '📟';
            colorFromField.value = data.colorFrom || '#ffffff';
            colorToField.value = data.colorTo || '#ffffff';
            shortDescriptionField.value = data.short_description || '';
            scoreField.value = '';
            pinnedField.checked = false;
            favoritedField.checked = false;

            autofillIcon.classList.remove('animate-spin');
        })
        .catch(err => {
            autofillIcon.classList.remove('animate-spin');
            console.error('Autofill error:', err);
            alert('Autofill failed. Check console for details.');
        });

    });

    fetch('/api/tags')
        .then(response => response.json())
        .then(data => {
            srenderTags(data);
        })
        .catch(error => {
            console.error('Error fetching tags:', error);
        });

    fetchShortcuts();
    fetchTags();
});
