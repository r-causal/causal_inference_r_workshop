convert_to_pdf <- function(.html_file) {
  pdf_file <- fs::path(
    "slides",
    "pdf",
    fs::path_ext_set(fs::path_file(.html_file), "pdf")
  )
  
  usethis::ui_done("Converting {usethis::ui_path(.html_file)} to PDF")
  suppress(renderthis::to_pdf(.html_file, pdf_file))
}

suppress <- function(code) {
  suppressMessages(
    suppressWarnings(
      suppressPackageStartupMessages(
        code
      )
    )
  )
}

# Get all HTML files in slides/raw directory
html_files <- fs::dir_ls("slides/raw", glob = "*.html")

# Convert each HTML file to PDF
purrr::walk(html_files, convert_to_pdf)
