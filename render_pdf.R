
library(magrittr)

render_pdf_slides <- function(rmd_name, render = TRUE) {
  if (render) {
    usethis::ui_done("Rendering {usethis::ui_path(rmd_name)}")
    rmarkdown::render(rmd_name, quiet = TRUE, envir = new.env())
  }

  dir <- fs::path_dir(rmd_name)
  html_file <- rmd_name
  fs::path_ext(html_file) <- "html"

  html_name <- normalizePath(html_file)
  file_name <- paste0("file://", html_name)

  pdf_file <- rmd_name
  fs::path_ext(pdf_file) <- "pdf"

  usethis::ui_done("Rendering {usethis::ui_path(pdf_file)}")
  pdf_name <- suppressMessages({
    webshot2::webshot(file_name, pdf_file, delay = 1)
  })

  invisible(pdf_name)
}

fs::dir_ls("slides/", regexp = ".Rmd") %>%
  purrr::walk(render_pdf_slides, render = FALSE)
