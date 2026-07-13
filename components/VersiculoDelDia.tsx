import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Card } from './ui/Card';
import { IconCircle } from './ui/IconCircle';
import { Skeleton } from './ui/Skeleton';
import { fetchJson } from '@/services/http';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Fonts, Spacing, Typography } from '@/constants/Theme';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const formatFecha = (fecha: Date) =>
  `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;

const VersiculoDelDia = () => {
  const [verseData, setVerseData] = useState({
    versiculo: '',
    referencia: '',
    reflexion: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const insets = useSafeAreaInsets();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const fetchVerse = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchJson<{ versiculo: string; referencia: string; reflexion: string }>(
        'https://versiculo-diario-api.vercel.app/api/versiculo-del-dia'
      );
      setVerseData(data);
    } catch (e) {
      console.warn('Error al obtener el versículo:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  const compartirVersiculo = async () => {
    try {
      await Share.share({
        message: `“${verseData.versiculo}”\n— ${verseData.referencia}\n\n📻 Radio LNJ · 100.9 FM`,
      });
    } catch {
      // El usuario canceló o el share falló; no hace falta feedback
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header: título + fecha, calendario a la derecha */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: text }]}>Versículo del día</Text>
          <Text style={[styles.date, { color: textSecondary }]}>{formatFecha(new Date())}</Text>
        </View>
        <IconCircle name="calendar-month-outline" />
      </View>

      {loading ? (
        <>
          {/* Skeleton card 1: versículo */}
          <Card style={styles.cardSpacing}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <Skeleton width={130} height={16} style={[styles.skeletonCenter, { marginTop: Spacing.lg }]} />
            <Skeleton height={16} style={{ marginTop: Spacing.xl }} />
            <Skeleton height={16} style={{ marginTop: Spacing.sm }} />
            <Skeleton width="65%" height={16} style={[styles.skeletonCenter, { marginTop: Spacing.sm }]} />
          </Card>

          {/* Skeleton card 2: reflexión */}
          <Card>
            <View style={styles.reflectionHeader}>
              <Skeleton width={44} height={44} borderRadius={22} />
              <Skeleton width={150} height={16} />
            </View>
            <Skeleton height={13} />
            <Skeleton height={13} style={{ marginTop: Spacing.sm }} />
            <Skeleton height={13} style={{ marginTop: Spacing.sm }} />
            <Skeleton width="80%" height={13} style={{ marginTop: Spacing.sm }} />
          </Card>
        </>
      ) : error ? (
        <Card>
          <IconCircle name="wifi-off" />
          <Text style={[styles.errorText, { color: textSecondary }]}>
            No se pudo cargar el versículo. Revisá tu conexión.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: primary }]}
            onPress={fetchVerse}
            accessibilityRole="button"
            accessibilityLabel="Reintentar cargar el versículo"
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          {/* Card 1: versículo */}
          <Card style={styles.cardSpacing}>
            <IconCircle name="book-open-variant" />

            <View style={styles.referenceRow}>
              <View style={[styles.referenceLine, { backgroundColor: border }]} />
              <Text style={[styles.reference, { color: primary }]}>{verseData.referencia}</Text>
              <View style={[styles.referenceLine, { backgroundColor: border }]} />
            </View>

            <Text style={[styles.quoteMark, { color: primary }]}>“</Text>

            <Text style={[styles.verse, { color: text }]}>{verseData.versiculo}</Text>

            <TouchableOpacity
              style={[styles.shareButton, { borderColor: primary }]}
              onPress={compartirVersiculo}
              accessibilityRole="button"
              accessibilityLabel="Compartir el versículo del día"
            >
              <MaterialCommunityIcons name="share-variant" size={16} color={primary} />
              <Text style={[styles.shareText, { color: primary }]}>Compartir</Text>
            </TouchableOpacity>
          </Card>

          {/* Card 2: reflexión */}
          <Card>
            <View style={styles.reflectionHeader}>
              <IconCircle name="lightbulb-on-outline" />
              <Text style={[styles.reflectionTitle, { color: text }]}>Reflexión del día</Text>
            </View>

            <Text style={[styles.reflection, { color: textSecondary }]}>
              {verseData.reflexion}
            </Text>

            <View style={[styles.divider, { backgroundColor: border }]} />

            <View style={[styles.blockquote, { borderLeftColor: primary }]}>
              <Text style={[styles.blockquoteText, { color: textSecondary }]}>
                “{verseData.versiculo}”{'\n'}— {verseData.referencia}
              </Text>
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...Typography.title,
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  date: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    fontWeight: '500',
  },
  skeletonCenter: {
    alignSelf: 'center',
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'center',
    borderRadius: 100,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.lg,
  },
  retryText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: 100,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xl,
  },
  shareText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '700',
  },
  cardSpacing: {
    marginBottom: Spacing.lg,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  referenceLine: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
  },
  reference: {
    ...Typography.section,
    fontSize: 19,
    textAlign: 'center',
  },
  quoteMark: {
    fontFamily: Fonts.regular,
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: -Spacing.lg,
  },
  verse: {
    fontFamily: Fonts.regular,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  reflectionTitle: {
    ...Typography.section,
    fontSize: 19,
  },
  reflection: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xl,
  },
  blockquote: {
    borderLeftWidth: 4,
    paddingLeft: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  blockquoteText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});

export default VersiculoDelDia;
