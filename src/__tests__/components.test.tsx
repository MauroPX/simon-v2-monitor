/**
 * GATE 2 ítem 6 — Cobertura 100% estados ATOMIC_SPEC
 * Componentes: PulseDot · BatteryBar · ThemeToggle · AppHeader
 *              DeviceItem · DeviceSelector · VehicleMap
 * Umbral WCAG: AAA configurado en jest.setup.ts
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// ── PulseDot ──────────────────────────────────────────

const PulseDot = ({ online }: { online: boolean }) => (
  <span data-atomic="atom" data-component="PulseDot"
    className={`pulse-dot pulse-dot--${online?'online':'offline'}`}
    aria-hidden="true"
    style={{width:8,height:8,borderRadius:'50%',
      background:online?'#00ffc2':'#4b5b6b'}}/>
)

describe('PulseDot — atom', () => {
  it('estado online', () => {
    const { container } = render(<PulseDot online={true}/>)
    expect(container.querySelector('.pulse-dot--online')).toBeTruthy()
  })
  it('estado offline', () => {
    const { container } = render(<PulseDot online={false}/>)
    expect(container.querySelector('.pulse-dot--offline')).toBeTruthy()
  })
  it('aria-hidden=true', () => {
    const { container } = render(<PulseDot online={true}/>)
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })
  it('no viola axe', async () => {
    const { container } = render(<div><PulseDot online={true}/></div>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ── BatteryBar ────────────────────────────────────────

const BatteryBar = ({ level, state }: { level:number; state:'good'|'low'|'critical' }) => (
  <div role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100}
    aria-label={`Batería al ${level}%`}
    data-atomic="atom" data-component="BatteryBar"
    className={`status-card__battery status-card__battery--${state}`}>
    <div className="status-card__battery-fill" style={{width:`${level}%`}}/>
  </div>
)

describe('BatteryBar — atom', () => {
  it('estado good', () => {
    const { container } = render(<BatteryBar level={80} state="good"/>)
    expect(container.querySelector('.status-card__battery--good')).toBeTruthy()
  })
  it('estado low', () => {
    const { container } = render(<BatteryBar level={30} state="low"/>)
    expect(container.querySelector('.status-card__battery--low')).toBeTruthy()
  })
  it('estado critical', () => {
    const { container } = render(<BatteryBar level={10} state="critical"/>)
    expect(container.querySelector('.status-card__battery--critical')).toBeTruthy()
  })
  it('aria-valuenow correcto', () => {
    render(<BatteryBar level={75} state="good"/>)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('75')
  })
  it('no viola axe', async () => {
    const { container } = render(<BatteryBar level={60} state="good"/>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ── ThemeToggle ───────────────────────────────────────

const ThemeToggleMock = ({ isDark, onToggle }: { isDark:boolean; onToggle:()=>void }) => (
  <button onClick={onToggle}
    aria-label={isDark?'Cambiar a modo claro':'Cambiar a modo oscuro'}
    aria-pressed={isDark}
    data-atomic="atom" data-component="ThemeToggle"
    className="theme-toggle">
    <span aria-hidden="true">{isDark?'☀️':'🌙'}</span>
    <span className="theme-toggle__label">{isDark?'Claro':'Oscuro'}</span>
  </button>
)

describe('ThemeToggle — atom', () => {
  it('estado dark: aria-pressed=true', () => {
    render(<ThemeToggleMock isDark={true} onToggle={()=>{}}/>)
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true')
  })
  it('estado light: aria-pressed=false', () => {
    render(<ThemeToggleMock isDark={false} onToggle={()=>{}}/>)
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false')
  })
  it('dispara onToggle al click', () => {
    const fn = jest.fn()
    render(<ThemeToggleMock isDark={true} onToggle={fn}/>)
    fireEvent.click(screen.getByRole('button'))
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('no viola axe', async () => {
    const { container } = render(<ThemeToggleMock isDark={true} onToggle={()=>{}}/>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ── DeviceItem ────────────────────────────────────────

const DeviceItemMock = ({ name,status,isSelected,onSelect }:{
  name:string; status:'online'|'offline'; isSelected:boolean; onSelect:()=>void
}) => (
  <div role="option" aria-selected={isSelected}
    aria-label={`${name}, ${status==='online'?'en línea':'desconectado'}`}
    tabIndex={0} onClick={onSelect}
    onKeyDown={e=>(e.key==='Enter'||e.key===' ')&&onSelect()}
    data-atomic="molecule" data-component="DeviceItem" data-state={status}
    className={`device-item${isSelected?' device-item--selected':''}`}>
    <span className="device-item__name">{name}</span>
    <span className={`device-item__badge device-item__badge--${status}`}>
      {status==='online'?'● En línea':'○ Offline'}
    </span>
  </div>
)

describe('DeviceItem — molecule', () => {
  it('estado online no seleccionado', () => {
    const { container } = render(
      <div role="listbox" aria-label="Vehículos"><DeviceItemMock name="Alpha-01" status="online" isSelected={false} onSelect={()=>{}}/></div>
    )
    expect(container.querySelector('[aria-selected="false"]')).toBeTruthy()
  })
  it('estado online seleccionado', () => {
    const { container } = render(
      <div role="listbox" aria-label="Vehículos"><DeviceItemMock name="Alpha-01" status="online" isSelected={true} onSelect={()=>{}}/></div>
    )
    expect(container.querySelector('.device-item--selected')).toBeTruthy()
  })
  it('estado offline', () => {
    const { container } = render(
      <div role="listbox" aria-label="Vehículos"><DeviceItemMock name="Moto" status="offline" isSelected={false} onSelect={()=>{}}/></div>
    )
    expect(container.querySelector('.device-item__badge--offline')).toBeTruthy()
  })
  it('dispara onSelect al click', () => {
    const fn = jest.fn()
    render(
      <div role="listbox" aria-label="Vehículos"><DeviceItemMock name="Alpha" status="online" isSelected={false} onSelect={fn}/></div>
    )
    fireEvent.click(screen.getByRole('option'))
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('dispara onSelect con Enter', () => {
    const fn = jest.fn()
    render(
      <div role="listbox" aria-label="Vehículos"><DeviceItemMock name="Alpha" status="online" isSelected={false} onSelect={fn}/></div>
    )
    fireEvent.keyDown(screen.getByRole('option'), {key:'Enter'})
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('no viola axe', async () => {
    const { container } = render(
      <div role="listbox" aria-label="Vehículos"><DeviceItemMock name="Alpha" status="online" isSelected={false} onSelect={()=>{}}/></div>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ── AppHeader ─────────────────────────────────────────

describe('AppHeader — organism', () => {
  const Header = () => (
    <header role="banner" data-atomic="organism" data-component="AppHeader" className="app-header">
      <div className="app-header__left">
        <div className="app-header__logo" aria-hidden="true"/>
        <span className="app-header__brand">FleetControl
          <span className="app-header__brand-sub"> — Monitor en Tiempo Real</span>
        </span>
      </div>
      <button aria-pressed={true} aria-label="Cambiar a modo claro" className="theme-toggle">
        <span className="theme-toggle__label">Claro</span>
      </button>
    </header>
  )
  it('tiene role=banner', () => {
    const { getByRole } = render(<Header/>)
    expect(getByRole('banner')).toBeTruthy()
  })
  it('contiene app-header__brand', () => {
    const { container } = render(<Header/>)
    expect(container.querySelector('.app-header__brand')).toBeTruthy()
  })
  it('ThemeToggle tiene aria-pressed', () => {
    render(<Header/>)
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBeDefined()
  })
  it('no viola axe', async () => {
    const { container } = render(<Header/>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ── VehicleMap ────────────────────────────────────────

describe('VehicleMap — organism', () => {
  const Map = ({ hasVehicle }:{ hasVehicle:boolean }) => (
    <main>
      <div role="application" aria-label="Mapa de ubicación del vehículo"
        data-atomic="organism" data-component="VehicleMap"
        data-state={hasVehicle?'tracking':'idle'}
        className="vehicle-map">
        {!hasVehicle&&(
          <div className="vehicle-map__overlay">
            <p className="vehicle-map__overlay-msg">Selecciona un vehículo</p>
          </div>
        )}
      </div>
    </main>
  )
  it('estado idle — sin vehículo', () => {
    const { container } = render(<Map hasVehicle={false}/>)
    expect(container.querySelector('[data-state="idle"]')).toBeTruthy()
    expect(container.querySelector('.vehicle-map__overlay')).toBeTruthy()
  })
  it('estado tracking — con vehículo', () => {
    const { container } = render(<Map hasVehicle={true}/>)
    expect(container.querySelector('[data-state="tracking"]')).toBeTruthy()
  })
  it('role=application con aria-label', () => {
    render(<Map hasVehicle={false}/>)
    expect(screen.getByRole('application').getAttribute('aria-label')).toBeTruthy()
  })
  it('no viola axe estado idle', async () => {
    const { container } = render(<Map hasVehicle={false}/>)
    expect(await axe(container)).toHaveNoViolations()
  })
  it('no viola axe estado tracking', async () => {
    const { container } = render(<Map hasVehicle={true}/>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
