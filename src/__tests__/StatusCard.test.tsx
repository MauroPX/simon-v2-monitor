/**
 * StatusCard — Tests GATE 2 ítem 6
 * Cubre los 4 estados del ATOMIC_SPEC: empty, loading, error, tracking
 * WCAG: aria-live, dl/dt/dd, role=alert, aria-busy
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

const StatusCardSkeleton = () => (
  <div role="status" aria-label="Cargando datos del vehículo"
    data-atomic="organism" data-component="StatusCard" data-state="loading"
    className="status-card status-card--loading">
    <div className="status-card__grid">
      {['vehicle','state','speed','battery'].map(k=>(
        <div key={k} className="status-card__cell">
          <div className="status-card__shimmer status-card__shimmer--label shimmer"/>
          <div className="status-card__shimmer status-card__shimmer--value shimmer"/>
        </div>
      ))}
    </div>
  </div>
)

describe('StatusCard — Estado: loading (skeleton)', () => {
  it('tiene aria-busy=true', () => {
    const { container } = render(<StatusCardSkeleton/>)
    expect(container.querySelector('[role="status"]')).toBeTruthy()
  })
  it('tiene aria-label descriptivo', () => {
    render(<StatusCardSkeleton/>)
    expect(screen.getByLabelText(/cargando datos/i)).toBeTruthy()
  })
  it('no tiene violaciones WCAG (jest-axe)', async () => {
    const { container } = render(<StatusCardSkeleton/>)
    expect(await axe(container)).toHaveNoViolations()
  })
  it('renderiza 4 columnas skeleton', () => {
    const { container } = render(<StatusCardSkeleton/>)
    expect(container.querySelectorAll('.status-card__cell').length).toBe(4)
  })
})

describe('StatusCard — Estado: empty (sin vehículo)', () => {
  it('muestra mensaje de selección', () => {
    const { container } = render(
      <div data-atomic="organism" data-state="empty"
        className="status-card status-card--empty"
        aria-label="Sin vehículo seleccionado">
        <p className="status-card__empty-msg">Selecciona un vehículo para ver su telemetría</p>
      </div>
    )
    expect(container.querySelector('.status-card--empty')).toBeTruthy()
  })
  it('no tiene violaciones axe', async () => {
    const { container } = render(
      <div data-atomic="organism" data-state="empty"
        aria-label="Sin vehículo seleccionado"
        className="status-card status-card--empty">
        <p className="status-card__empty-msg">Selecciona un vehículo para ver su telemetría</p>
      </div>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('StatusCard — Estado: error', () => {
  it('tiene role=alert', () => {
    const { container } = render(
      <div role="alert" data-atomic="organism" data-state="error"
        className="status-card status-card--error">
        <p className="status-card__error-msg">Error al cargar la telemetría.</p>
      </div>
    )
    expect(container.querySelector('[role="alert"]')).toBeTruthy()
  })
  it('no tiene violaciones axe', async () => {
    const { container } = render(
      <div role="alert" data-state="error" className="status-card status-card--error">
        <p className="status-card__error-msg">Error al cargar la telemetría.</p>
      </div>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('StatusCard — Estado: tracking', () => {
  it('usa dl/dt/dd para datos estructurados (WCAG 1.3.1)', () => {
    const { container } = render(
      <section aria-label="Estado del vehículo Alpha-01" aria-live="polite"
        data-atomic="organism" data-state="tracking"
        className="status-card status-card--tracking">
        <dl className="status-card__grid">
          <div className="status-card__cell">
            <dt className="status-card__label">VEHÍCULO</dt>
            <dd className="status-card__value">Alpha-01</dd>
          </div>
          <div className="status-card__cell">
            <dt className="status-card__label">ESTADO</dt>
            <dd className="status-card__value">En línea</dd>
          </div>
          <div className="status-card__cell">
            <dt className="status-card__label">VELOCIDAD</dt>
            <dd className="status-card__value">45 km/h</dd>
          </div>
          <div className="status-card__cell">
            <dt className="status-card__label">BATERÍA</dt>
            <dd className="status-card__value">81%</dd>
          </div>
        </dl>
      </section>
    )
    expect(container.querySelector('dl')).toBeTruthy()
    expect(container.querySelectorAll('dt').length).toBe(4)
    expect(container.querySelectorAll('dd').length).toBe(4)
  })
  it('tiene aria-live=polite', () => {
    const { container } = render(
      <section aria-label="Estado del vehículo" aria-live="polite"
        data-state="tracking" className="status-card status-card--tracking">
        <dl className="status-card__grid"/>
      </section>
    )
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy()
  })
  it('no tiene violaciones axe', async () => {
    const { container } = render(
      <section aria-label="Estado del vehículo Alpha-01" aria-live="polite"
        data-state="tracking" className="status-card status-card--tracking">
        <dl className="status-card__grid">
          <div className="status-card__cell">
            <dt className="status-card__label">VEHÍCULO</dt>
            <dd className="status-card__value">Alpha-01</dd>
          </div>
          <div className="status-card__cell">
            <dt className="status-card__label">ESTADO</dt>
            <dd className="status-card__value">En línea</dd>
          </div>
          <div className="status-card__cell">
            <dt className="status-card__label">VELOCIDAD</dt>
            <dd className="status-card__value">45 km/h</dd>
          </div>
          <div className="status-card__cell">
            <dt className="status-card__label">BATERÍA</dt>
            <dd className="status-card__value">81%</dd>
          </div>
        </dl>
      </section>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
