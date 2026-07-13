import React from 'react';
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import ProgramaEnVivo from './ProgramaEnVivo';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { IconCircle } from './ui/IconCircle';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Fonts, Radii, Spacing, Typography } from '@/constants/Theme';

// ── Datos de contacto (completar) ────────────────────────────────────────────
const DIRECCION = 'Chacabuco 1730, Grand Bourg';
const TELEFONO = ''; // ej: '+5411xxxxxxxx'
const WHATSAPP = ''; // ej: '5411xxxxxxxx' (sin + ni espacios, formato wa.me)
const SITIO_WEB = ''; // ej: 'https://radiolnj.com.ar'
// ─────────────────────────────────────────────────────────────────────────────

const DIAS_ABREV = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const REUNIONES = [
  { dia: 3, nombre: 'Miércoles', descripcion: 'Cultos y reuniones', horarios: '09:00, 17:00, 19:00 hs' },
  { dia: 4, nombre: 'Jueves', descripcion: 'Cultos y reuniones', horarios: '14:00 hs' },
  { dia: 5, nombre: 'Viernes', descripcion: 'Reunión Juvenil', horarios: '19:00 hs' },
  { dia: 6, nombre: 'Sábados', descripcion: 'Cultos y reuniones', horarios: '10:00, 17:00, 19:00 hs' },
  { dia: 0, nombre: 'Domingos', descripcion: 'Cultos y reuniones', horarios: '09:00, 11:00, 17:00, 19:00 hs' },
];

/** Número de día de la próxima ocurrencia del día de semana indicado. */
const proximaFecha = (diaSemana: number) => {
  const hoy = new Date();
  const diff = (diaSemana - hoy.getDay() + 7) % 7;
  const fecha = new Date(hoy);
  fecha.setDate(hoy.getDate() + diff);
  return fecha.getDate();
};

const openLink = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.warn('No se pudo abrir el enlace:', error);
  }
};

// ── Sub-componentes ──────────────────────────────────────────────────────────

const SectionTitle = ({
  icon,
  title,
  badge,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  badge?: string;
}) => {
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');

  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: primary }]}>
        <MaterialCommunityIcons name={icon} size={18} color="#fff" />
      </View>
      <Text style={[styles.sectionTitle, { color: text }]}>{title}</Text>
      {badge && <Badge label={badge} variant="info" />}
    </View>
  );
};

const SocialLink = ({
  icon,
  color,
  label,
  url,
  accessibilityLabel,
}: {
  icon: string;
  color: string;
  label: string;
  url: string;
  accessibilityLabel: string;
}) => {
  const textSecondary = useThemeColor({}, 'textSecondary');

  return (
    <TouchableOpacity
      style={styles.socialLink}
      onPress={() => openLink(url)}
      activeOpacity={0.7}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
    >
      <FontAwesome5 name={icon} size={22} color={color} />
      <Text style={[styles.socialLinkLabel, { color: textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const RedCard = ({
  icon,
  label,
  nombre,
  descripcion,
  facebookUrl,
  instagramUrl,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  nombre: string;
  descripcion: string;
  facebookUrl: string;
  instagramUrl: string;
}) => {
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const primary = useThemeColor({}, 'primary');

  return (
    <Card padding={Spacing.lg} style={styles.cardSpacing}>
      <View style={styles.redCardRow}>
        <IconCircle name={icon} />
        <View style={styles.redCardInfo}>
          <Text style={[styles.redCardLabel, { color: primary }]}>{label}</Text>
          <Text style={[styles.redCardName, { color: text }]}>{nombre}</Text>
          <Text style={[styles.redCardDescription, { color: textSecondary }]} numberOfLines={2}>
            {descripcion}
          </Text>
        </View>
        <View style={styles.socialRow}>
          <SocialLink
            icon="facebook"
            color="#1877F2"
            label="Facebook"
            url={facebookUrl}
            accessibilityLabel={`Facebook de ${nombre}`}
          />
          <SocialLink
            icon="instagram"
            color="#E1306C"
            label="Instagram"
            url={instagramUrl}
            accessibilityLabel={`Instagram de ${nombre}`}
          />
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={textTertiary} />
      </View>
    </Card>
  );
};

const ReunionRow = ({
  dia,
  nombre,
  descripcion,
  horarios,
  isLast,
}: {
  dia: number;
  nombre: string;
  descripcion: string;
  horarios: string;
  isLast: boolean;
}) => {
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const primary = useThemeColor({}, 'primary');
  const iconCircle = useThemeColor({}, 'iconCircle');
  const border = useThemeColor({}, 'border');

  return (
    <View style={[styles.reunionRow, !isLast && { borderBottomWidth: 1, borderBottomColor: border }]}>
      <View style={[styles.dateBadge, { backgroundColor: iconCircle }]}>
        <Text style={[styles.dateBadgeDay, { color: primary }]}>{DIAS_ABREV[dia]}</Text>
        <Text style={[styles.dateBadgeNumber, { color: primary }]}>{proximaFecha(dia)}</Text>
      </View>

      <View style={styles.reunionInfo}>
        <Text style={[styles.reunionDay, { color: text }]}>{nombre}</Text>
        <Text style={[styles.reunionDescription, { color: textSecondary }]}>{descripcion}</Text>
      </View>

      <View style={styles.reunionTimes}>
        <MaterialCommunityIcons name="clock-outline" size={14} color={textSecondary} />
        <Text style={[styles.reunionTimesText, { color: textSecondary }]}>{horarios}</Text>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={20} color={textTertiary} />
    </View>
  );
};

const QuickAction = ({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) => {
  const surface = useThemeColor({}, 'surface');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');

  return (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: surface }, disabled && styles.quickActionDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon} size={26} color={primary} />
      <Text style={[styles.quickActionLabel, { color: textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ── Pantalla ─────────────────────────────────────────────────────────────────

const SocialMediaScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: text }]}>Nuestras Redes</Text>
        <Image
          source={require('@/assets/images/ministeriologo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
          accessibilityLabel="LNJ - Ministerio La Nueva Jerusalén"
        />
      </View>
      <Text style={[styles.headerSubtitle, { color: primary }]}>Conectate con nosotros</Text>
      <Text style={[styles.headerText, { color: textSecondary }]}>
        Seguinos para recibir transmisiones, anuncios y actividades.
      </Text>
      <View style={[styles.headerAccentLine, { backgroundColor: primary }]} />

      {/* Cards de redes */}
      <View style={styles.sectionContainer}>
        <RedCard
          icon="church"
          label="MINISTERIO"
          nombre="La Nueva Jerusalén"
          descripcion="Transmisiones, noticias, eventos y más."
          facebookUrl="https://www.facebook.com/IglesiaLNJerusalenBsAs"
          instagramUrl="https://www.instagram.com/ministeriolanuevajerusalen/?hl=es-la"
        />
        <RedCard
          icon="account-group"
          label="JÓVENES"
          nombre="LNJ Jóvenes"
          descripcion="Actividades y encuentros de la juventud."
          facebookUrl="https://www.facebook.com/JoveLnj"
          instagramUrl="https://www.instagram.com/joveneslnj/?hl=es-la"
        />
      </View>

      {/* Programación */}
      <View style={styles.sectionContainer}>
        <SectionTitle icon="calendar-month-outline" title="Programación" badge="HOY" />
        <ProgramaEnVivo />
      </View>

      {/* Reuniones */}
      <View style={styles.sectionContainer}>
        <SectionTitle icon="account-group-outline" title="Reuniones" />
        <Card padding={Spacing.lg}>
          {REUNIONES.map((reunion, index) => (
            <ReunionRow
              key={reunion.nombre}
              {...reunion}
              isLast={index === REUNIONES.length - 1}
            />
          ))}
        </Card>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.sectionContainer}>
        <SectionTitle icon="lightning-bolt-outline" title="Acciones rápidas" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRow}>
          <QuickAction
            icon="map-marker-outline"
            label="Cómo llegar"
            onPress={() => openLink(`https://maps.google.com/?q=${encodeURIComponent(DIRECCION)}`)}
          />
          <QuickAction
            icon="phone-outline"
            label="Contactar"
            onPress={() => openLink(`tel:${TELEFONO}`)}
            disabled={!TELEFONO}
          />
          <QuickAction
            icon="whatsapp"
            label="WhatsApp"
            onPress={() => openLink(`https://wa.me/${WHATSAPP}`)}
            disabled={!WHATSAPP}
          />
          <QuickAction
            icon="web"
            label="Sitio Web"
            onPress={() => openLink(SITIO_WEB)}
            disabled={!SITIO_WEB}
          />
          <QuickAction
            icon="radio-tower"
            label="Escuchar Radio"
            onPress={() => router.navigate('/(tabs)' as any)}
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: 110, // deja lugar a la tab bar flotante
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...Typography.title,
    fontSize: 28,
    flex: 1,
  },
  headerLogo: {
    width: 48,
    height: 48,
  },
  headerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 17,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  headerText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginTop: Spacing.xs,
    lineHeight: 21,
  },
  headerAccentLine: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionContainer: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    marginBottom: Spacing.lg,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.section,
  },
  cardSpacing: {
    marginBottom: Spacing.lg,
  },
  redCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  redCardInfo: {
    flex: 1,
  },
  redCardLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  redCardName: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  redCardDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialLink: {
    alignItems: 'center',
    gap: Spacing.xs,
    width: 56,
  },
  socialLinkLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    fontWeight: '600',
  },
  reunionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  dateBadge: {
    width: 46,
    height: 50,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadgeDay: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateBadgeNumber: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: '800',
  },
  reunionInfo: {
    flex: 1,
  },
  reunionDay: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    fontWeight: '700',
  },
  reunionDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 1,
  },
  reunionTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: 110,
  },
  reunionTimesText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  quickActionsRow: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: 2,
  },
  quickAction: {
    width: 84,
    height: 84,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  quickActionDisabled: {
    opacity: 0.45,
  },
  quickActionLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SocialMediaScreen;
