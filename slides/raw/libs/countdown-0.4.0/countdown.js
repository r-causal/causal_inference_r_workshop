/* globals Shiny,Audio */
class CountdownTimer {
  constructor (el, opts) {
    if (typeof el === 'string' || el instanceof String) {
      el = document.querySelector(el)
    }

    if (el.counter) {
      return el.counter
    }

    const minutes = parseInt(el.querySelector('.minutes').innerText || '0')
    const seconds = parseInt(el.querySelector('.seconds').innerText || '0')
    const duration = minutes * 60 + seconds

    function attrIsTrue (x) {
      if (x === true) return true
      return !!(x === 'true' || x === '' || x === '1')
    }

    this.element = el
    this.duration = duration
    this.end = null
    this.is_running = false
    this.warn_when = parseInt(el.dataset.warnWhen) || -1
    this.update_every = parseInt(el.dataset.updateEvery) || 1
    this.play_sound = attrIsTrue(el.dataset.playSound)
    this.blink_colon = attrIsTrue(el.dataset.blinkColon)
    this.startImmediately = attrIsTrue(el.dataset.startImmediately)
    this.timeout = null
    this.display = { minutes, seconds }

    if (opts.src_location) {
      this.src_location = opts.src_location
    }

    this.addEventListeners()
  }

  addEventListeners () {
    const self = this

    if (this.startImmediately) {
      if (window.remark && window.slideshow) {
        // Remark (xaringan) support
        const isOnVisibleSlide = () => {
          return document.querySelector('.remark-visible').contains(self.element)
        }
        if (isOnVisibleSlide()) {
          self.start()
        } else {
          let started_once = 0
          window.slideshow.on('afterShowSlide', function () {
            if (started_once > 0) return
            if (isOnVisibleSlide()) {
              self.start()
              started_once = 1
            }
          })
        }
      } else if (window.Reveal) {
        // Revealjs (quarto) support
        const isOnVisibleSlide = () => {
          const currentSlide = document.querySelector('.reveal .slide.present')
          return currentSlide ? currentSlide.contains(self.element) : false
        }
        if (isOnVisibleSlide()) {
          self.start()
        } else {
          const revealStartTimer = () => {
            if (isOnVisibleSlide()) {
              self.start()
              window.Reveal.off('slidechanged', revealStartTimer)
            }
          }
          window.Reveal.on('slidechanged', revealStartTimer)
        }
      } else if (window.IntersectionObserver) {
        // All other situtations use IntersectionObserver
        const onVisible = (element, callback) => {
          new window.IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.intersectionRatio > 0) {
                callback(element)
                observer.disconnect()
              }
            })
          }).observe(element)
        }
        onVisible(this.element, el => el.countdown.start())
      } else {
        // or just start the timer as soon as it's initialized
        this.start()
      }
    }

    function haltEvent (ev) {
      ev.preventDefault()
      ev.stopPropagation()
    }
    function isSpaceOrEnter (ev) {
      return ev.code === 'Space' || ev.code === 'Enter'
    }
    function isArrowUpOrDown (ev) {
      return ev.code === 'ArrowUp' || ev.code === 'ArrowDown'
    }

    ;['click', 'touchend'].forEach(function (eventType) {
      self.element.addEventListener(eventType, function (ev) {
        haltEvent(ev)
        self.is_running ? self.stop() : self.start()
      })
    })
    this.element.addEventListener('keydown', function (ev) {
      if (ev.code === "Escape") {
        self.reset()
        haltEvent(ev)
      }
      if (!isSpaceOrEnter(ev) && !isArrowUpOrDown(ev)) return
      haltEvent(ev)
      if (isSpaceOrEnter(ev)) {
        self.is_running ? self.stop() : self.start()
        return
      }

      if (!self.is_running) return

      if (ev.code === 'ArrowUp') {
        self.bumpUp()
      } else if (ev.code === 'ArrowDown') {
        self.bumpDown()
      }
    })
    this.element.addEventListener('dblclick', function (ev) {
      haltEvent(ev)
      if (self.is_running) self.reset()
    })
    this.element.addEventListener('touchmove', haltEvent)

    const btnBumpDown = this.element.querySelector('.countdown-bump-down')
    ;['click', 'touchend'].forEach(function (eventType) {
      btnBumpDown.addEventListener(eventType, function (ev) {
        haltEvent(ev)
        if (self.is_running) self.bumpDown()
      })
    })
    btnBumpDown.addEventListener('keydown', function (ev) {
      if (!isSpaceOrEnter(ev) || !self.is_running) return
      haltEvent(ev)
      self.bumpDown()
    })

    const btnBumpUp = this.element.querySelector('.countdown-bump-up')
    ;['click', 'touchend'].forEach(function (eventType) {
      btnBumpUp.addEventListener(eventType, function (ev) {
        haltEvent(ev)
        if (self.is_running) self.bumpUp()
      })
    })
    btnBumpUp.addEventListener('keydown', function (ev) {
      if (!isSpaceOrEnter(ev) || !self.is_running) return
      haltEvent(ev)
      self.bumpUp()
    })
    this.element.querySelector('.countdown-controls').addEventListener('dblclick', function (ev) {
      haltEvent(ev)
    })
  }

  remainingTime () {
    const remaining = this.is_running
      ? (this.end - Date.now()) / 1000
      : this.remaining || this.duration

    let minutes = Math.floor(remaining / 60)
    let seconds = Math.ceil(remaining - minutes * 60)

    if (seconds > 59) {
      minutes = minutes + 1
      seconds = seconds - 60
    }

    return { remaining, minutes, seconds }
  }

  start () {
    if (this.is_running) return

    this.is_running = true

    if (this.remaining) {
      // Having a static remaining time indicates timer was paused
      this.end = Date.now() + this.remaining * 1000
      this.remaining = null
    } else {
      this.end = Date.now() + this.duration * 1000
    }

    this.reportStateToShiny('start')

    this.element.classList.remove('finished')
    this.element.classList.add('running')
    this.update(true)
    this.tick()
  }

  tick (run_again) {
    if (typeof run_again === 'undefined') {
      run_again = true
    }

    if (!this.is_running) return

    const { seconds: secondsWas } = this.display
    this.update()

    if (run_again) {
      const delay = (this.end - Date.now() > 10000) ? 1000 : 250
      this.blinkColon(secondsWas)
      this.timeout = setTimeout(this.tick.bind(this), delay)
    }
  }

  blinkColon (secondsWas) {
    // don't blink unless option is set
    if (!this.blink_colon) return
    // warn_when always updates the seconds
    if (this.warn_when > 0 && Date.now() + this.warn_when > this.end) {
      this.element.classList.remove('blink-colon')
      return
    }
    const { seconds: secondsIs } = this.display
    if (secondsIs > 10 || secondsWas !== secondsIs) {
      this.element.classList.toggle('blink-colon')
    }
  }

  update (force) {
    if (typeof force === 'undefined') {
      force = false
    }

    const { remaining, minutes, seconds } = this.remainingTime()

    const setRemainingTime = (selector, time) => {
      const timeContainer = this.element.querySelector(selector)
      if (!timeContainer) return
      time = Math.max(time, 0)
      timeContainer.innerText = String(time).padStart(2, 0)
    }

    if (this.is_running && remaining < 0.25) {
      this.stop()
      setRemainingTime('.minutes', 0)
      setRemainingTime('.seconds', 0)
      this.playSound()
      return
    }

    const should_update = force ||
      Math.round(remaining) < this.warn_when ||
      Math.round(remaining) % this.update_every === 0

    if (should_update) {
      this.element.classList.toggle('warning', remaining <= this.warn_when)
      this.display = { minutes, seconds }
      setRemainingTime('.minutes', minutes)
      setRemainingTime('.seconds', seconds)
    }
  }

  stop () {
    const { remaining } = this.remainingTime()
    if (remaining > 1) {
      this.remaining = remaining
    }
    this.element.classList.remove('running')
    this.element.classList.remove('warning')
    this.element.classList.remove('blink-colon')
    this.element.classList.add('finished')
    this.is_running = false
    this.end = null
    this.reportStateToShiny('stop')
    this.timeout = clearTimeout(this.timeout)
  }

  reset () {
    this.stop()
    this.remaining = null
    this.update(true)
    this.reportStateToShiny('reset')
    this.element.classList.remove('finished')
    this.element.classList.remove('warning')
  }

  setValues (opts) {
    if (typeof opts.warn_when !== 'undefined') {
      this.warn_when = opts.warn_when
    }
    if (typeof opts.update_every !== 'undefined') {
      this.update_every = opts.update_every
    }
    if (typeof opts.blink_colon !== 'undefined') {
      this.blink_colon = opts.blink_colon
      if (!opts.blink_colon) {
        this.element.classList.remove('blink-colon')
      }
    }
    if (typeof opts.play_sound !== 'undefined') {
      this.play_sound = opts.play_sound
    }
    if (typeof opts.duration !== 'undefined') {
      this.duration = opts.duration
      if (this.is_running) {
        this.reset()
        this.start()
      }
    }
    this.reportStateToShiny('update')
    this.update(true)
  }

  bumpTimer (val, round) {
    round = typeof round === 'boolean' ? round : true
    const { remaining } = this.remainingTime()
    let newRemaining = remaining + val
    if (newRemaining <= 0) {
      this.setRemaining(0)
      this.stop()
      return
    }
    if (round && newRemaining > 10) {
      newRemaining = Math.round(newRemaining / 5) * 5
    }
    this.setRemaining(newRemaining)
    this.reportStateToShiny(val > 0 ? 'bumpUp' : 'bumpDown')
    this.update(true)
  }

  bumpUp (val) {
    if (!this.is_running) {
      console.error('timer is not running')
      return
    }
    this.bumpTimer(
      val || this.bumpIncrementValue(),
      typeof val === 'undefined'
    )
  }

  bumpDown (val) {
    if (!this.is_running) {
      console.error('timer is not running')
      return
    }
    this.bumpTimer(
      val || -1 * this.bumpIncrementValue(),
      typeof val === 'undefined'
    )
  }

  setRemaining (val) {
    if (!this.is_running) {
      console.error('timer is not running')
      return
    }
    this.end = Date.now() + val * 1000
    this.update(true)
  }

  playSound () {
    let url = this.play_sound
    if (!url) return
    if (typeof url === 'boolean') {
      const src = this.src_location
        ? this.src_location.replace('/countdown.js', '')
        : 'libs/countdown'
      url = src + '/smb_stage_clear.mp3'
    }
    const sound = new Audio(url)
    sound.play()
  }

  bumpIncrementValue (val) {
    val = val || this.remainingTime().remaining
    if (val <= 30) {
      return 5
    } else if (val <= 300) {
      return 15
    } else if (val <= 3000) {
      return 30
    } else {
      return 60
    }
  }

  reportStateToShiny (action) {
    if (!window.Shiny) return

    const inputId = this.element.id
    const data = {
      event: {
        action,
        time: new Date().toISOString()
      },
      timer: {
        is_running: this.is_running,
        end: this.end ? new Date(this.end).toISOString() : null,
        remaining: this.remainingTime()
      }
    }

    function shinySetInputValue () {
      if (!window.Shiny.setInputValue) {
        setTimeout(shinySetInputValue, 100)
        return
      }
      window.Shiny.setInputValue(inputId, data)
    }

    shinySetInputValue()
  }
}

(function () {
  const CURRENT_SCRIPT = document.currentScript.getAttribute('src')

  document.addEventListener('DOMContentLoaded', function () {
    const els = document.querySelectorAll('.countdown')
    if (!els || !els.length) {
      return
    }
    els.forEach(function (el) {
      el.countdown = new CountdownTimer(el, { src_location: CURRENT_SCRIPT })
    })

    if (window.Shiny) {
      Shiny.addCustomMessageHandler('countdown:update', function (x) {
        if (!x.id) {
          console.error('No `id` provided, cannot update countdown')
          return
        }
        const el = document.getElementById(x.id)
        el.countdown.setValues(x)
      })

      Shiny.addCustomMessageHandler('countdown:start', function (id) {
        const el = document.getElementById(id)
        if (!el) return
        el.countdown.start()
      })

      Shiny.addCustomMessageHandler('countdown:stop', function (id) {
        const el = document.getElementById(id)
        if (!el) return
        el.countdown.stop()
      })

      Shiny.addCustomMessageHandler('countdown:reset', function (id) {
        const el = document.getElementById(id)
        if (!el) return
        el.countdown.reset()
      })

      Shiny.addCustomMessageHandler('countdown:bumpUp', function (id) {
        const el = document.getElementById(id)
        if (!el) return
        el.countdown.bumpUp()
      })

      Shiny.addCustomMessageHandler('countdown:bumpDown', function (id) {
        const el = document.getElementById(id)
        if (!el) return
        el.countdown.bumpDown()
      })
    }
  })
})()
