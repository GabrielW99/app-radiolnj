import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Card } from './ui/Card';
import { IconCircle } from './ui/IconCircle';
import { Skeleton } from './ui/Skeleton';
import { fetchJson } from '@/services/http';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Fonts, Spacing } from '@/constants/Theme';

export type Program = {
  nombre: string;
  horaInicio: number;
  horaFin: number;
  imagen: string;
  dias: number[]; // 0 = Domingo, 1 = Lunes, ... 6 = Sábado (Date.getDay())
};

type Ocurrencia = { programa: Program; dia: number };

const DIAS_NOMBRE = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Busca la próxima emisión a partir de un día/hora, recorriendo la semana. */
const buscarProximo = (
  programas: Program[],
  desdeDia: number,
  desdeHora: number
): Ocurrencia | null => {
  for (let offset = 0; offset <= 7; offset++) {
    const dia = (desdeDia + offset) % 7;
    const minHora = offset === 0 ? desdeHora : -1;
    const candidato = programas
      .filter((p) => p.dias.includes(dia) && p.horaInicio > minHora)
      .sort((a, b) => a.horaInicio - b.horaInicio)[0];
    if (candidato) return { programa: candidato, dia };
  }
  return null;
};

const ProgramaEnVivo = () => {
  const [programas, setProgramas] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const fetchProgramas = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchJson<Program[]>(
        'https://radiolnj-api.gabrielblanco2399.workers.dev/programas'
      );
      setProgramas([...data].sort((a, b) => a.horaInicio - b.horaInicio));
    } catch (e) {
      console.warn('Error al cargar la programación:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgramas();
  }, [fetchProgramas]);

  if (loading) {
    return (
      <Card padding={Spacing.lg}>
        <View style={styles.row}>
          <View style={styles.leftHalf}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <Skeleton width={80} height={16} style={{ marginTop: Spacing.sm }} />
            <Skeleton width="90%" height={14} />
            <Skeleton width="60%" height={12} />
          </View>
          <View style={[styles.verticalDivider, { backgroundColor: border }]} />
          <View style={styles.rightHalf}>
            <Skeleton width={70} height={12} />
            <Skeleton width="85%" height={14} />
            <Skeleton width="70%" height={12} />
          </View>
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding={Spacing.lg}>
        <Text style={[styles.emptyText, { color: textSecondary }]}>
          No se pudo cargar la programación. Revisá tu conexión.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: primary }]}
          onPress={fetchProgramas}
          accessibilityRole="button"
          accessibilityLabel="Reintentar cargar la programación"
        >
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  const hora = new Date().getHours();
  const hoy = new Date().getDay(); // 0 = Domingo ... 6 = Sábado

  const enVivo = programas.find(
    (p) => p.dias.includes(hoy) && hora >= p.horaInicio && hora < p.horaFin
  );

  // Mitad izquierda: lo que suena ahora, o la próxima emisión
  const actual: Ocurrencia | null = enVivo
    ? { programa: enVivo, dia: hoy }
    : buscarProximo(programas, hoy, hora);

  // Mitad derecha: la emisión siguiente a la de la izquierda
  const siguiente = actual
    ? buscarProximo(programas, actual.dia, actual.programa.horaInicio)
    : null;

  if (!actual) {
    return (
      <Card padding={Spacing.lg}>
        <Text style={[styles.emptyText, { color: textSecondary }]}>
          No hay programación disponible
        </Text>
      </Card>
    );
  }

  const labelDia = (dia: number) => (dia === hoy ? 'Hoy' : DIAS_NOMBRE[dia]);

  return (
    <Card padding={Spacing.lg}>
      <View style={styles.row}>
        {/* Mitad izquierda: ahora / próxima transmisión */}
        <View style={styles.leftHalf}>
          <IconCircle name="antenna" size={40} />
          <Text style={[styles.time, { color: primary }]}>
            {actual.programa.horaInicio}:00 hs
          </Text>
          <Text style={[styles.name, { color: text }]} numberOfLines={2}>
            {actual.programa.nombre}
          </Text>
          <Text style={[styles.description, { color: textSecondary }]}>
            {enVivo ? 'Transmisión en vivo' : `Próxima · ${labelDia(actual.dia)}`}
          </Text>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: border }]} />

        {/* Mitad derecha: lo que sigue */}
        <View style={styles.rightHalf}>
          <Text style={[styles.nextLabel, { color: primary }]}>Próximo</Text>
          {siguiente ? (
            <>
              <Text style={[styles.nextDay, { color: text }]}>
                {labelDia(siguiente.dia)} {siguiente.programa.horaInicio}:00 hs
              </Text>
              <Text style={[styles.nextName, { color: textSecondary }]} numberOfLines={2}>
                {siguiente.programa.nombre}
              </Text>
            </>
          ) : (
            <Text style={[styles.nextName, { color: textSecondary }]}>Sin datos</Text>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={textTertiary}
            style={styles.chevron}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  leftHalf: {
    flex: 1.2,
    gap: Spacing.xs,
  },
  verticalDivider: {
    width: 1,
    marginHorizontal: Spacing.lg,
  },
  rightHalf: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  time: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  name: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  nextLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextDay: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    fontWeight: '700',
  },
  nextName: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  chevron: {
    alignSelf: 'flex-end',
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'center',
    borderRadius: 100,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  retryText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProgramaEnVivo;
