# _plugins/liquid_ruby4_patch.rb
# Liquid 4.0.x calls `obj.tainted?` which was removed in Ruby 3.2+.
# This patch makes taint_check a no-op on Ruby 3.2+.
if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new("3.2.0")
  module Liquid
    class Variable
      def taint_check(_context, _obj)
        # no-op — tainted? was removed from Ruby 3.2
      end
    end
  end
end
