<template>
    <div v-if="Array.isArray(data)">
        <edit-area
            v-for="(item, index) of data"
            :key="index"
            :origin="origin"
            :KEY="KEY"
            :index="index"
        >
        </edit-area>
    </div>
    <div v-else>
        <edit-area :origin="origin" :KEY="KEY"></edit-area>
    </div>
</template>

<script>
import editArea from './editArea'

export default {
    props: {
        data: [Array, String],
        origin: Object,
        KEY: String,
    },
    components: {
        editArea,
    },
}
</script>
