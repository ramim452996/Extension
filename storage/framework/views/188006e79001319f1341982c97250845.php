<?php
if (!function_exists('_188006e79001319f1341982c97250845')):
function _188006e79001319f1341982c97250845($__blaze, $__data = [], $__slots = [], $__bound = [], $__keys = [], $__this = null) {
$__env = $__blaze->env;
$__slots['slot'] ??= new \Illuminate\View\ComponentSlot('');
if (($__data['attributes'] ?? null) instanceof \Illuminate\View\ComponentAttributeBag) { $__data = $__data + $__data['attributes']->all(); unset($__data['attributes']); }
extract($__slots, EXTR_SKIP); unset($__slots);
extract($__data, EXTR_SKIP);
$attributes = \Livewire\Blaze\Runtime\BlazeAttributeBag::make($__data, $__bound, $__keys);
unset($__data, $__bound, $__keys);
ob_start();
?>


<?php
extract(Flux::forwardedAttributes($attributes, [
    'name',
    'descriptionTrailing',
    'description',
    'label',
    'badge',
]));
?>

<?php $descriptionTrailing = $descriptionTrailing ??= $attributes->pluck('description:trailing'); ?>

<?php
$__defaults = [
    'name' => $attributes->whereStartsWith('wire:model')->first(),
    'descriptionTrailing' => null,
    'description' => null,
    'label' => null,
    'badge' => null,
];
$name ??= $attributes['name'] ?? $__defaults['name']; unset($attributes['name']);
$descriptionTrailing ??= $attributes['description-trailing'] ?? $attributes['descriptionTrailing'] ?? $__defaults['descriptionTrailing']; unset($attributes['descriptionTrailing'], $attributes['description-trailing']);
$description ??= $attributes['description'] ?? $__defaults['description']; unset($attributes['description']);
$label ??= $attributes['label'] ?? $__defaults['label']; unset($attributes['label']);
$badge ??= $attributes['badge'] ?? $__defaults['badge']; unset($attributes['badge']);
unset($__defaults);
?>

<?php if (isset($label) || isset($description) || isset($descriptionTrailing)): ?>
    <?php

        $fieldAttributes = Flux::attributesAfter('field:', $attributes, []);
        $labelAttributes = Flux::attributesAfter('label:', $attributes, ['badge' => $badge]);
        $descriptionAttributes = Flux::attributesAfter('description:', $attributes, []);
        $errorAttributes = Flux::attributesAfter('error:', $attributes, ['name' => $name]);
    ?>
    <?php if (!function_exists('_7d36c8f2b953ac7bcab302363958fb92')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/field.blade.php', $__blaze->compiledPath.'/7d36c8f2b953ac7bcab302363958fb92.php'); require $__blaze->compiledPath.'/7d36c8f2b953ac7bcab302363958fb92.php'; } ?>
<?php if (isset($__slots7d36c8f2b953ac7bcab302363958fb92)) { $__slotsStack7d36c8f2b953ac7bcab302363958fb92[] = $__slots7d36c8f2b953ac7bcab302363958fb92; } ?>
<?php if (isset($__attrs7d36c8f2b953ac7bcab302363958fb92)) { $__attrsStack7d36c8f2b953ac7bcab302363958fb92[] = $__attrs7d36c8f2b953ac7bcab302363958fb92; } ?>
<?php $__attrs7d36c8f2b953ac7bcab302363958fb92 = ['attributes' => $fieldAttributes]; ?>
<?php $__slots7d36c8f2b953ac7bcab302363958fb92 = []; ?>
<?php $__blaze->pushData($__attrs7d36c8f2b953ac7bcab302363958fb92); ?>
<?php ob_start(); ?>
        <?php if (isset($label)): ?>
            <?php if (!function_exists('_b158887c3a227c4e0d3ae8b54ec1b4d3')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/label.blade.php', $__blaze->compiledPath.'/b158887c3a227c4e0d3ae8b54ec1b4d3.php'); require $__blaze->compiledPath.'/b158887c3a227c4e0d3ae8b54ec1b4d3.php'; } ?>
<?php if (isset($__slotsb158887c3a227c4e0d3ae8b54ec1b4d3)) { $__slotsStackb158887c3a227c4e0d3ae8b54ec1b4d3[] = $__slotsb158887c3a227c4e0d3ae8b54ec1b4d3; } ?>
<?php if (isset($__attrsb158887c3a227c4e0d3ae8b54ec1b4d3)) { $__attrsStackb158887c3a227c4e0d3ae8b54ec1b4d3[] = $__attrsb158887c3a227c4e0d3ae8b54ec1b4d3; } ?>
<?php $__attrsb158887c3a227c4e0d3ae8b54ec1b4d3 = ['attributes' => $labelAttributes]; ?>
<?php $__slotsb158887c3a227c4e0d3ae8b54ec1b4d3 = []; ?>
<?php $__blaze->pushData($__attrsb158887c3a227c4e0d3ae8b54ec1b4d3); ?>
<?php ob_start(); ?><?php echo e($label); ?><?php $__slotsb158887c3a227c4e0d3ae8b54ec1b4d3['slot'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), []); ?>
<?php $__blaze->pushSlots($__slotsb158887c3a227c4e0d3ae8b54ec1b4d3); ?>
<?php _b158887c3a227c4e0d3ae8b54ec1b4d3($__blaze, $__attrsb158887c3a227c4e0d3ae8b54ec1b4d3, $__slotsb158887c3a227c4e0d3ae8b54ec1b4d3, ['attributes'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStackb158887c3a227c4e0d3ae8b54ec1b4d3)) { $__slotsb158887c3a227c4e0d3ae8b54ec1b4d3 = array_pop($__slotsStackb158887c3a227c4e0d3ae8b54ec1b4d3); } ?>
<?php if (! empty($__attrsStackb158887c3a227c4e0d3ae8b54ec1b4d3)) { $__attrsb158887c3a227c4e0d3ae8b54ec1b4d3 = array_pop($__attrsStackb158887c3a227c4e0d3ae8b54ec1b4d3); } ?>
<?php $__blaze->popData(); ?>
        <?php endif; ?>

        <?php if (isset($description)): ?>
            <?php if (!function_exists('_02cd2d04d714cbd7104804a26ef3ea5e')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/description.blade.php', $__blaze->compiledPath.'/02cd2d04d714cbd7104804a26ef3ea5e.php'); require $__blaze->compiledPath.'/02cd2d04d714cbd7104804a26ef3ea5e.php'; } ?>
<?php if (isset($__slots02cd2d04d714cbd7104804a26ef3ea5e)) { $__slotsStack02cd2d04d714cbd7104804a26ef3ea5e[] = $__slots02cd2d04d714cbd7104804a26ef3ea5e; } ?>
<?php if (isset($__attrs02cd2d04d714cbd7104804a26ef3ea5e)) { $__attrsStack02cd2d04d714cbd7104804a26ef3ea5e[] = $__attrs02cd2d04d714cbd7104804a26ef3ea5e; } ?>
<?php $__attrs02cd2d04d714cbd7104804a26ef3ea5e = ['attributes' => $descriptionAttributes]; ?>
<?php $__slots02cd2d04d714cbd7104804a26ef3ea5e = []; ?>
<?php $__blaze->pushData($__attrs02cd2d04d714cbd7104804a26ef3ea5e); ?>
<?php ob_start(); ?><?php echo e($description); ?><?php $__slots02cd2d04d714cbd7104804a26ef3ea5e['slot'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), []); ?>
<?php $__blaze->pushSlots($__slots02cd2d04d714cbd7104804a26ef3ea5e); ?>
<?php _02cd2d04d714cbd7104804a26ef3ea5e($__blaze, $__attrs02cd2d04d714cbd7104804a26ef3ea5e, $__slots02cd2d04d714cbd7104804a26ef3ea5e, ['attributes'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStack02cd2d04d714cbd7104804a26ef3ea5e)) { $__slots02cd2d04d714cbd7104804a26ef3ea5e = array_pop($__slotsStack02cd2d04d714cbd7104804a26ef3ea5e); } ?>
<?php if (! empty($__attrsStack02cd2d04d714cbd7104804a26ef3ea5e)) { $__attrs02cd2d04d714cbd7104804a26ef3ea5e = array_pop($__attrsStack02cd2d04d714cbd7104804a26ef3ea5e); } ?>
<?php $__blaze->popData(); ?>
        <?php endif; ?>

        <?php echo e($slot); ?>


        
        <?php $__getScope = fn($scope = []) => $scope; ?><?php if (isset($scope)) $__scope = $scope; ?><?php $scope = $__getScope(scope: ['attributes' => $errorAttributes->getAttributes()]); ?>
        <?php if (!function_exists('_29be144f173eaaca414e34d99298b9df')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/error.blade.php', $__blaze->compiledPath.'/29be144f173eaaca414e34d99298b9df.php'); require $__blaze->compiledPath.'/29be144f173eaaca414e34d99298b9df.php'; } ?>
<?php $__blaze->pushData(['attributes' => new \Illuminate\View\ComponentAttributeBag($scope['attributes'])]); ?>
<?php _29be144f173eaaca414e34d99298b9df($__blaze, ['attributes' => new \Illuminate\View\ComponentAttributeBag($scope['attributes'])], [], ['attributes'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php $__blaze->popData(); ?>
        <?php if (isset($__scope)) { $scope = $__scope; unset($__scope); } ?>

        <?php if (isset($descriptionTrailing)): ?>
            <?php if (!function_exists('_02cd2d04d714cbd7104804a26ef3ea5e')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/description.blade.php', $__blaze->compiledPath.'/02cd2d04d714cbd7104804a26ef3ea5e.php'); require $__blaze->compiledPath.'/02cd2d04d714cbd7104804a26ef3ea5e.php'; } ?>
<?php if (isset($__slots02cd2d04d714cbd7104804a26ef3ea5e)) { $__slotsStack02cd2d04d714cbd7104804a26ef3ea5e[] = $__slots02cd2d04d714cbd7104804a26ef3ea5e; } ?>
<?php if (isset($__attrs02cd2d04d714cbd7104804a26ef3ea5e)) { $__attrsStack02cd2d04d714cbd7104804a26ef3ea5e[] = $__attrs02cd2d04d714cbd7104804a26ef3ea5e; } ?>
<?php $__attrs02cd2d04d714cbd7104804a26ef3ea5e = ['attributes' => $descriptionAttributes]; ?>
<?php $__slots02cd2d04d714cbd7104804a26ef3ea5e = []; ?>
<?php $__blaze->pushData($__attrs02cd2d04d714cbd7104804a26ef3ea5e); ?>
<?php ob_start(); ?><?php echo e($descriptionTrailing); ?><?php $__slots02cd2d04d714cbd7104804a26ef3ea5e['slot'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), []); ?>
<?php $__blaze->pushSlots($__slots02cd2d04d714cbd7104804a26ef3ea5e); ?>
<?php _02cd2d04d714cbd7104804a26ef3ea5e($__blaze, $__attrs02cd2d04d714cbd7104804a26ef3ea5e, $__slots02cd2d04d714cbd7104804a26ef3ea5e, ['attributes'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStack02cd2d04d714cbd7104804a26ef3ea5e)) { $__slots02cd2d04d714cbd7104804a26ef3ea5e = array_pop($__slotsStack02cd2d04d714cbd7104804a26ef3ea5e); } ?>
<?php if (! empty($__attrsStack02cd2d04d714cbd7104804a26ef3ea5e)) { $__attrs02cd2d04d714cbd7104804a26ef3ea5e = array_pop($__attrsStack02cd2d04d714cbd7104804a26ef3ea5e); } ?>
<?php $__blaze->popData(); ?>
        <?php endif; ?>
    <?php $__slots7d36c8f2b953ac7bcab302363958fb92['slot'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), []); ?>
<?php $__blaze->pushSlots($__slots7d36c8f2b953ac7bcab302363958fb92); ?>
<?php _7d36c8f2b953ac7bcab302363958fb92($__blaze, $__attrs7d36c8f2b953ac7bcab302363958fb92, $__slots7d36c8f2b953ac7bcab302363958fb92, ['attributes'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStack7d36c8f2b953ac7bcab302363958fb92)) { $__slots7d36c8f2b953ac7bcab302363958fb92 = array_pop($__slotsStack7d36c8f2b953ac7bcab302363958fb92); } ?>
<?php if (! empty($__attrsStack7d36c8f2b953ac7bcab302363958fb92)) { $__attrs7d36c8f2b953ac7bcab302363958fb92 = array_pop($__attrsStack7d36c8f2b953ac7bcab302363958fb92); } ?>
<?php $__blaze->popData(); ?>
<?php else: ?>
    <?php echo e($slot); ?>

<?php endif; ?>
<?php
echo ltrim(ob_get_clean());
} endif; ?><?php /**PATH C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/with-field.blade.php ENDPATH**/ ?>