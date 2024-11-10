# Changelog

### v0.8 - Nov 10, 2024

> Fixed
```diff
+ Dates being converted to different formats or completely getting lost
+ Header names being case and whitespace sensitive
```

> Added / Removed
```diff
+ Changelog page
+ Better formatting for the changelog
```

### v0.7 - Aug 10-11, 2024

> Fixed
```diff
+ Unecessary font loading on every update
+ Puma font ;: characters weren't centered
+ Changed default rectangle color to be machine reset safe (apparently G:255 isn't saved across profile resets)
+ Weekly layout fix that will probably break for no reason
```

> Added / Removed
```diff
+ New Settings menu
+ Settings categories
+ Added lines to some tiny glyphs that would usually break off and result in longer transfer cleaning time
+ Sheet files are now labeled by their index + 5 random characters to prevent duplicates
- Removed "Download" and "Parsing" text from download button
```

### v0.6 - Aug 3-5, 2024

> Fixed
```diff
+ Parsing page with a priority order now works
+ Only checking for the first Position for the ID (essentially means some IDs would be missing if not manually noticed)
+ The masterfile parser not recognizing numbers
+ Inconsistent button hover changes
+ When creating new transfer, page will go to last + 1 instead of current + 1
```

> Added / Removed
```diff
+ Transfer packer
+ Precise page navigation via input field
+ Distinct styling for scrollbar
+ Transitions to hover animations on buttons
- Replaced default file input with custom component
- Removed collapse button for table preview
```

### v0.5 - Jul 27-28, 2024

> Fixed
```diff
+ Identifier text allowing for undefined values
+ Identifier text dynamically capped between 10-26pt for sake of saving material
+ ID text completely disappearing when the value is ''
+ Layout issues with large masterfiles
+ Puma & Nike fonts missing a lot of glyphs
+ Nike glyphs (like A, K, W, Y...) clipping if next to each other
+ Masterfile tab not allowing for text change
+ Masterfile tab not allowing for adding/removing of new transfers
+ Masterfile tab empty fields not showing up
```

> Added / Removed
```diff
+ Shoe order page parse and auto populate
+ Settings
+ Downloading indicator for large files
+ Delete transfer button
+ Light mode
+ Index column in table preview
+ Navbar new styling and my brand
+ '.notdef' glyph to Nike font
```

### v0.4 - Jul 20-21, 2024

> Fixed
```diff
+ Preview not scaling properly
+ Collapse button not toggling
+ Optimized letter counters for NIKE font
+ Improved layout consistency
+ Empty rows causing columns to not show up in table preview
+ Page navigation using arrow keys
```

> Added / Removed
```diff
+ Font size changes automatically based on font
+ Better error screen for preview
+ Add New button
+ Individual transfer tab
+ Masterfile tab
+ Debouncing to colors (significantly improves performance when switching colors rapidly)
+ Filtering out emoji/unknown symbols
+ Changelog.md
```

### v0.3 - Jul 13-14, 2024

> Fixed
```diff
+ Performance (wow, thanks past me)
+ Layout
```

> Added / Removed
```diff
+ Pagination
+ Download button
```

### v0.2 - Jul 7, 2024

> Untracked

### v0.1 - Jun 16-30, 2024

> Untracked
