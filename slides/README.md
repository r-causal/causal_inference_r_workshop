# Slides Directory

This directory contains the workshop slides.

## Directory Structure

- `raw/`: Source Quarto documents (.qmd) and rendered HTML files
- `pdf/`: PDF versions of the slides (generated from HTML)
- `render_slides.R`: Script to convert HTML slides to PDF

## Quarto Project Profiles

This workshop uses Quarto project profiles for different rendering scenarios:

### Development Profile (default)

Optimized for fast iteration during slide development:
- **freeze: auto**:
- **Usage**:
  ```bash
  # Render all slides (only changed files will be re-rendered)
  quarto render

  # Render specific slide (always executes)
  quarto render slides/raw/00-intro.qmd

  # Live preview
  quarto preview slides/raw/00-intro.qmd
  ```

### Production Profile

For clean, complete builds with PDF generation:
- **No caching**: Ensures fresh renders every time
- **Full re-render**: Always processes all content from scratch
- **Auto PDF generation**: Runs `render_slides.R` after rendering to create PDFs
- **Usage**:
  ```bash
  # Render all slides and generate PDFs
  quarto render --profile prod

  # Render specific slide with production settings
  # will build all PDFs after rendering, not just for this slide
  quarto render slides/raw/00-intro.qmd --profile prod
  ```

## Configuration Files

- `_quarto.yml`: Main project configuration
- `_quarto-dev.yml`: Development profile settings
- `_quarto-prod.yml`: Production profile settings

## Rendering Workflow

1. **During development**: Use the default dev profile for quick feedback
2. **For deployment**: Use `quarto render --profile prod` to ensure clean builds and PDF generation
3. **PDF generation only**: If you need to regenerate PDFs from existing HTML files, run:
   ```r
   source("slides/render_slides.R")
   ```
