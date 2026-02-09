import React from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { LinearGradient } from 'expo-linear-gradient';

export const FeaturedSpot: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View style={styles.wrapper}>
            <Typography variant="label" color="textSecondary" style={styles.sectionLabel}>
                SPOT DNIA
            </Typography>

            <TouchableOpacity activeOpacity={0.9} style={styles.container}>
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1440778303588-435521a205bc?q=80&w=2000&auto=format&fit=crop' }}
                    style={styles.image}
                    imageStyle={{ borderRadius: 24 }}
                >
                    <View style={styles.topRow}>
                        <Badge label="REKOMENDOWANY" variant="success" pulse />
                    </View>

                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,1.0)']}
                        locations={[0, 1]}
                        style={styles.contentGradient}
                    >
                        <View style={styles.content}>
                            <View style={styles.infoRow}>
                                <Typography variant="h2" style={styles.title}>Park Pole Mokotowskie</Typography>
                                <View style={styles.rating}>
                                    <Icon name="Star" size={16} color="#FBBF24" fill="#FBBF24" />
                                    <Typography variant="h3" style={styles.ratingText}>4.9</Typography>
                                </View>
                            </View>

                            <Typography variant="body" style={styles.desc}>
                                Ogromne otwarte przestrzenie i techniczne linie między drzewami.
                            </Typography>

                            <View style={styles.footer}>
                                <View style={styles.tag}>
                                    <Icon name="Wind" size={14} color="#fff" />
                                    <Typography variant="caption" style={styles.tagText}>Mały wiatr</Typography>
                                </View>
                                <View style={styles.tag}>
                                    <Icon name="Navigation" size={14} color="#fff" />
                                    <Typography variant="caption" style={styles.tagText}>2.4 km stąd</Typography>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 10,
        flex: 1,
    },
    sectionLabel: {
        marginBottom: 8,
        letterSpacing: 1.2,
        fontSize: 10,
    },
    container: {
        flex: 1,
        minHeight: 250,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    image: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    contentGradient: {
        width: '100%',
        paddingTop: 60,
        paddingBottom: 8,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    topRow: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
    },
    content: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    ratingText: {
        color: '#FFFFFF',
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '700',
    },
    desc: {
        color: '#E2E8F0',
        marginBottom: 12,
        fontSize: 15,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        color: '#FFFFFF',
        marginLeft: 4,
        fontWeight: '600',
        fontSize: 11,
    }
});
