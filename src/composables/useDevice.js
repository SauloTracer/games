import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useDevice() {
    const isMobile = ref(false)

    const mediaQuery = window.matchMedia('(max-width: 768px)')

    const updateDevice = () => {
        isMobile.value = mediaQuery.matches
    }

    onMounted(() => {
        updateDevice()
        mediaQuery.addEventListener('change', updateDevice)
    })

    onBeforeUnmount(() => {
        mediaQuery.removeEventListener('change', updateDevice)
    })

    return { isMobile }
}