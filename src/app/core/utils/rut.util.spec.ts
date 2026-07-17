import { formatearRut, esRutValido, limpiarRut, calcularDigitoVerificador, rutValidator } from './rut.util';

describe('rut.util', () => {
  describe('limpiarRut', () => {
    it('elimina puntos, guion y espacios', () => {
      expect(limpiarRut('11.111.111-1')).toBe('111111111');
      expect(limpiarRut(' 7.6 2 2-K ')).toBe('7622K');
    });
  });

  describe('calcularDigitoVerificador', () => {
    it('calcula el dígito verificador correcto', () => {
      expect(calcularDigitoVerificador('76222222')).toBe('1');
      expect(calcularDigitoVerificador('11111111')).toBe('1');
    });

    it('retorna K cuando corresponde', () => {
      expect(calcularDigitoVerificador('1000005')).toBe('K');
    });
  });

  describe('formatearRut', () => {
    it('formatea un RUT sin puntos ni guion', () => {
      expect(formatearRut('762222221')).toBe('76.222.222-1');
    });

    it('formatea progresivamente mientras se escribe', () => {
      expect(formatearRut('7')).toBe('7');
      expect(formatearRut('76')).toBe('7-6');
      expect(formatearRut('7622222')).toBe('762.222-2');
    });

    it('retorna cadena vacía para entrada vacía', () => {
      expect(formatearRut('')).toBe('');
    });
  });

  describe('esRutValido', () => {
    it('acepta un RUT válido con o sin formato', () => {
      expect(esRutValido('76.222.222-1')).toBe(true);
      expect(esRutValido('762222221')).toBe(true);
      expect(esRutValido('1.000.005-K')).toBe(true);
    });

    it('rechaza un RUT con dígito verificador incorrecto', () => {
      expect(esRutValido('76.222.222-2')).toBe(false);
    });

    it('rechaza entradas demasiado cortas o vacías', () => {
      expect(esRutValido('')).toBe(false);
      expect(esRutValido('1')).toBe(false);
    });
  });

  describe('rutValidator', () => {
    const validator = rutValidator();

    it('no marca error en campo vacío', () => {
      expect(validator({ value: '' } as any)).toBeNull();
    });

    it('marca rutInvalido para un RUT incorrecto', () => {
      expect(validator({ value: '11.111.111-2' } as any)).toEqual({ rutInvalido: true });
    });

    it('no marca error para un RUT correcto', () => {
      expect(validator({ value: '11.111.111-1' } as any)).toBeNull();
    });
  });
});
