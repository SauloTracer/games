// AdSense.vue
<template>
    <div v-if="!isMobile && adUnit">
        <ins
            class="adsbygoogle"
            :style="displayStyle"
            :data-ad-client="adClient"
            :data-ad-slot="adSlot[adUnit]"
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    </div>
    <v-dialog
        v-model="showMobileAd"
        persistent
        width="auto"
    >
        <v-card>
            <v-card-title>Anúncio</v-card-title>
            <v-card-text>
                <ins
                    class="adsbygoogle"
                    :style="{ display: 'block', width: '300px', height: '250px', margin: '0 auto' }"
                    data-ad-client="ca-pub-8041117169271031"
                    data-ad-slot="6664202035"
                    data-ad-format="horizontal"
                    data-full-width-responsive="true"
                ></ins>
            </v-card-text>
            <v-card-actions>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="showMobileAd = false"
                >Fechar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { useIsMobileStore } from '@/stores/isMobile'; // Importe o store Pinia

export default {
    props: {
        adUnit: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            adClient: 'ca-pub-8041117169271031',
            adSlot: {
                top: '8535116081',
                left: '9523171803',
                right: '5351120363',
                mobile: '6664202035'
            },
            displayStyle: {},
            showMobileAd: false
        };
    },
    setup() {
        const isMobileStore = useIsMobileStore(); // Use o store Pinia
        return { isMobileStore };
    },
    computed: {
        isMobile() {
            return this.isMobileStore.isMobile; // Acesse o estado isMobile
        }
    },
    mounted() {
        if (this.adUnit === 'top') {
            this.displayStyle = { display: 'block', width: '728px', height: '90px', margin: '0 auto' };
        } else if (this.adUnit === 'left') {
            this.displayStyle = { display: 'block', width: '160px', height: '600px', float: 'left', marginRight: '20px' };
        } else if (this.adUnit === 'right') {
            this.displayStyle = { display: 'block', width: '160px', height: '600px', float: 'right', marginLeft: '20px' };
        }

        setTimeout(() => {
            (adsbygoogle = window.adsbygoogle || []).push({});
        }, 5000);

        if (this.isMobile) {
            setTimeout(() => {
                this.showMobileAd = true;
            }, 5000);
        }
    }
};
</script>